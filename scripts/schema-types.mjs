// Membandingkan katalog PostgreSQL schema public dengan types/database.ts (format supabase gen types).
import { createRequire } from "node:module";

const ts = createRequire(import.meta.url)("typescript");
const SCALAR = { text: "string", uuid: "string", date: "string", timestamptz: "string", varchar: "string", bool: "boolean", int2: "number", int4: "number", int8: "number", numeric: "number", jsonb: "Json", json: "Json", inet: "unknown" };
const ARG = { uuid: "string", text: "string", integer: "number", bigint: "number", boolean: "boolean" };
const RETURNS = { void: "undefined", json: "Json", jsonb: "Json", boolean: "boolean" };

const SQL = {
  columns: `select c.table_name, c.column_name, c.is_nullable = 'YES' as nullable,
      (c.column_default is not null or c.is_identity = 'YES') as has_default, c.data_type, c.udt_name
    from information_schema.columns c join information_schema.tables t using (table_schema, table_name)
    where c.table_schema = 'public' and t.table_type = 'BASE TABLE'`,
  relationships: `select con.conname, cl.relname as tbl, rf.relname as ref,
      (select array_agg(a.attname::text order by k.ord) from unnest(con.conkey) with ordinality k(n, ord) join pg_attribute a on a.attrelid = con.conrelid and a.attnum = k.n) as cols,
      (select array_agg(a.attname::text order by k.ord) from unnest(con.confkey) with ordinality k(n, ord) join pg_attribute a on a.attrelid = con.confrelid and a.attnum = k.n) as refcols,
      exists (select from pg_index i where i.indrelid = con.conrelid and i.indisunique
        and (select array_agg(x order by x) from unnest(i.indkey::int2[]) x) = (select array_agg(x order by x) from unnest(con.conkey) x)) as one
    from pg_constraint con join pg_class cl on cl.oid = con.conrelid join pg_class rf on rf.oid = con.confrelid
    join pg_namespace n on n.oid = cl.relnamespace join pg_namespace rn on rn.oid = rf.relnamespace
    where con.contype = 'f' and n.nspname = 'public' and rn.nspname = 'public'`,
  functions: `select p.proname, pg_get_function_result(p.oid) as res,
      coalesce((select string_agg(n || ':' || t, ',' order by n) from unnest(p.proargnames[1:p.pronargs], string_to_array(oidvectortypes(p.proargtypes), ', ')) as a(n, t)), '') as args
    from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
    where ns.nspname = 'public' and pg_get_function_result(p.oid) <> 'trigger'`,
  enums: `select t.typname, array_agg(e.enumlabel::text order by e.enumsortorder) as labels
    from pg_type t join pg_enum e on e.enumtypid = t.oid join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' group by t.typname`,
};

export async function readCatalog(client) {
  const catalog = {};
  for (const [key, sql] of Object.entries(SQL)) catalog[key] = (await client.query(sql)).rows;
  return catalog;
}

export function readTypes(source) {
  const file = ts.createSourceFile("database.ts", source, ts.ScriptTarget.Latest, true);
  const text = (node) => node.getText(file).replace(/\s+/g, " ").trim();
  const members = (lit) => Object.fromEntries(lit.members.filter(ts.isPropertySignature).map((m) => [m.name.getText(file), m]));
  let database;
  file.forEachChild((n) => {
    if (ts.isTypeAliasDeclaration(n) && n.name.text === "Database") database = n.type;
  });
  const pub = members(members(database).public.type);
  const tables = {};
  for (const [name, table] of Object.entries(members(pub.Tables.type))) {
    const parts = members(table.type);
    const cols = (key) => Object.fromEntries(Object.entries(members(parts[key].type)).map(([c, m]) => [c, { type: text(m.type), optional: !!m.questionToken }]));
    const rels = parts.Relationships.type.elements.map((e) => {
      const o = members(e);
      return ["foreignKeyName", "columns", "isOneToOne", "referencedRelation", "referencedColumns"].map((k) => text(o[k].type).replace(/\[\s*/g, "[").replace(/,?\s*\]/g, "]")).join(" ");
    });
    tables[name] = { Row: cols("Row"), Insert: cols("Insert"), Update: cols("Update"), rels: rels.sort() };
  }
  const functions = Object.fromEntries(Object.entries(members(pub.Functions.type)).map(([name, f]) => {
    const p = members(f.type);
    const args = ts.isTypeLiteralNode(p.Args.type) ? Object.entries(members(p.Args.type)).map(([a, m]) => `${a}:${text(m.type)}`).sort().join(",") : text(p.Args.type);
    return [name, { args, returns: text(p.Returns.type) }];
  }));
  const enums = ts.isTypeLiteralNode(pub.Enums.type)
    ? Object.fromEntries(Object.entries(members(pub.Enums.type)).map(([name, m]) => [name, text(m.type).split("|").map((s) => s.trim().replace(/"/g, ""))]))
    : {};
  return { tables, functions, enums };
}

export function compareSchema(catalog, types) {
  const diffs = [];
  const db = {};
  for (const r of catalog.columns) {
    const base = r.data_type === "USER-DEFINED" ? `Database["public"]["Enums"]["${r.udt_name}"]` : SCALAR[r.udt_name] ?? `?${r.udt_name}`;
    (db[r.table_name] ??= {})[r.column_name] = { type: base + (r.nullable ? " | null" : ""), insertOptional: r.nullable || r.has_default };
  }
  const rels = {};
  for (const f of catalog.relationships)
    (rels[f.tbl] ??= []).push(`"${f.conname}" [${f.cols.map((x) => `"${x}"`).join(", ")}] ${f.one} "${f.ref}" [${f.refcols.map((x) => `"${x}"`).join(", ")}]`);
  for (const t of new Set([...Object.keys(db), ...Object.keys(types.tables)])) {
    const d = db[t], s = types.tables[t];
    if (!d || !s) { diffs.push(`table ${t}: ${d ? "missing in types" : "only in types"}`); continue; }
    for (const col of new Set([...Object.keys(d), ...Object.keys(s.Row)])) {
      if (!d[col]) { diffs.push(`${t}.${col}: only in types`); continue; }
      if (!s.Row[col]) { diffs.push(`${t}.${col}: only in db`); continue; }
      for (const k of ["Row", "Insert", "Update"]) {
        const sc = s[k][col];
        if (!sc) { diffs.push(`${t}.${col}: missing in ${k}`); continue; }
        if (sc.type !== d[col].type) diffs.push(`${t}.${col} ${k}: types=${sc.type} db=${d[col].type}`);
        const want = k === "Row" ? false : k === "Update" ? true : d[col].insertOptional;
        if (sc.optional !== want) diffs.push(`${t}.${col} ${k}: optional types=${sc.optional} db=${want}`);
      }
    }
    const want = (rels[t] ?? []).sort().join(" | ");
    if (want !== s.rels.join(" | ")) diffs.push(`${t} relationships: types=${s.rels.join(" | ")} db=${want}`);
  }
  for (const name of new Set([...catalog.functions.map((f) => f.proname), ...Object.keys(types.functions)])) {
    const f = catalog.functions.find((x) => x.proname === name), s = types.functions[name];
    if (!f || !s) { diffs.push(`function ${name}: ${f ? "missing in types" : "only in types"}`); continue; }
    const args = f.args ? f.args.split(",").map((a) => { const [n, t] = a.split(":"); return `${n}:${ARG[t] ?? "?" + t}`; }).sort().join(",") : "never";
    if (args !== s.args) diffs.push(`function ${name} args: types=${s.args} db=${args}`);
    if ((RETURNS[f.res] ?? "?" + f.res) !== s.returns) diffs.push(`function ${name} returns: types=${s.returns} db=${f.res}`);
  }
  for (const name of new Set([...catalog.enums.map((e) => e.typname), ...Object.keys(types.enums)])) {
    const e = catalog.enums.find((x) => x.typname === name), s = types.enums[name];
    if (!e || !s) { diffs.push(`enum ${name}: ${e ? "missing in types" : "only in types"}`); continue; }
    if (e.labels.join(",") !== s.join(",")) diffs.push(`enum ${name}: types=${s} db=${e.labels}`);
  }
  return diffs;
}
