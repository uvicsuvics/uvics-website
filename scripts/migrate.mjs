import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { psql, target } from "./tooling.mjs";
// Explicit project argument prevents accidental application to a different env.
if (process.argv[2] !== target())
  throw Error("Usage: npm run db:migrate -- <verified-project-ref>");
const files = readdirSync("supabase/migrations")
  .filter((f) => /^\d+_.+\.sql$/.test(f))
  .sort();
const migrationSql = files
  .map((file) => {
    const sql = readFileSync(join("supabase/migrations", file), "utf8").replace(
      /\r\n/g,
      "\n",
    );
    const digest = createHash("sha256").update(sql).digest("hex");
    return `DO $migration$ BEGIN
 IF EXISTS(SELECT FROM private.migration_checksums WHERE filename='${file}' AND checksum<>'${digest}') THEN RAISE EXCEPTION 'Applied migration checksum differs';END IF;
 IF NOT EXISTS(SELECT FROM private.migration_checksums WHERE filename='${file}') THEN
 ${sql}
 INSERT INTO private.migration_checksums VALUES('${file}','${digest}',statement_timestamp());
 INSERT INTO supabase_migrations.schema_migrations(version,name,statements) VALUES('${file.split("_")[0]}','${file.replace(/^\d+_|\.sql$/g, "")}',ARRAY[$source$${sql}$source$]);
 END IF; END $migration$;`;
  })
  .join("\n");
psql(`BEGIN;select pg_advisory_xact_lock(720260922);create schema if not exists private;
create table if not exists private.migration_checksums(filename text primary key,checksum text not null,applied_at timestamptz not null);
revoke all on private.migration_checksums from public,anon,authenticated,service_role;
create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations(version text primary key,statements text[],name text);
${migrationSql}\nNOTIFY pgrst,'reload schema';COMMIT;`);
console.log(
  JSON.stringify({
    target: target(),
    migrations: files,
    status: "applied-or-checksum-verified",
  }),
);
