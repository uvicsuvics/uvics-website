import pg from "pg";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { compareSchema, readCatalog, readTypes } from "./schema-types.mjs";
const directory = mkdtempSync(join(tmpdir(), "uvics-db-"));
const defaultWinBin =
  [
    "C:/Program Files/PostgreSQL/18/bin",
    "C:/Program Files/PostgreSQL/17/bin",
  ].find((p) => {
    try {
      return existsSync(p);
    } catch {
      return false;
    }
  }) || "C:/Program Files/PostgreSQL/17/bin";
const bin =
  process.env.PG_BIN ||
  (process.platform === "win32"
    ? defaultWinBin
    : "/usr/lib/postgresql/17/bin");
const port = Number(process.env.TEST_PG_PORT || 55437);
const external = process.env.TEST_DATABASE_URL;
if (external) {
  const url = new URL(external);
  if (
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.pathname !== "/uvics_test"
  ) {
    throw Error("Only loopback disposable uvics_test database is allowed");
  }
}
const connection = external
  ? { connectionString: external }
  : { host: "127.0.0.1", port, database: "postgres", user: "postgres" };

function run(name, args) {
  const r = spawnSync(
    join(bin, name + (process.platform === "win32" ? ".exe" : "")),
    args,
    { stdio: "ignore", windowsHide: true, timeout: 60000 },
  );
  if (r.status !== 0)
    throw Error(`${name} failed; inspect disposable log in ${directory}`);
}
let started = false;
let client;
try {
  if (!external) {
    run("initdb", [
      "-D",
      directory,
      "-U",
      "postgres",
      "--auth=trust",
      "--encoding=UTF8",
      "--no-locale",
    ]);
    writeFileSync(
      join(directory, "pg_hba.conf"),
      "local all all trust\nhost all all 127.0.0.1/32 trust\n",
    );
    run("pg_ctl", [
      "-D",
      directory,
      "-l",
      join(directory, "server.log"),
      "-o",
      `-p ${port} -h 127.0.0.1`,
      "-w",
      "start",
    ]);
    started = true;
  }
  client = new pg.Client(connection);
  await client.connect();
  const existing = await client.query(
    "select exists(select from pg_tables where schemaname in ('public','auth','private')) as populated",
  );
  if (existing.rows[0].populated)
    throw Error("Disposable database must be empty; no reset is performed");
  await client.query(readFileSync("tests/db/bootstrap.sql", "utf8"));
  for (const file of readdirSync("supabase/migrations")
    .filter((x) => x.endsWith(".sql"))
    .sort())
    await client.query(readFileSync(join("supabase/migrations", file), "utf8"));
  const failures = [];
  // Satu langkah gagal tidak menghentikan langkah lain; rollback memulihkan koneksi dari transaksi yang batal.
  const step = async (name, run) => {
    const start = performance.now();
    try {
      await run();
      console.log(`PASS ${name} (${Math.round(performance.now() - start)} ms)`);
    } catch (error) {
      failures.push(name);
      console.error(`FAIL ${name}: ${error.message}`);
      await client.query("rollback").catch(() => {});
    }
  };
  for (const file of [
    "tests/db/foundation.sql",
    "tests/db/media.sql",
    "tests/db/rate-limit.sql",
    "tests/db/organization.sql",
    "tests/db/membership.sql",
    "tests/db/content.sql",
    "tests/db/cms.sql",
    "tests/db/seeder-organization.sql",
  ])
    await step(file, () => client.query(readFileSync(file, "utf8")));
  await step("scripts/seed-cms.sql (2x) + tests/db/seeder-cms.sql", async () => {
    const seedCms = readFileSync("scripts/seed-cms.sql", "utf8");
    await client.query(seedCms);
    await client.query(seedCms); // rerun harus idempotent
    await client.query(readFileSync("tests/db/seeder-cms.sql", "utf8"));
  });
  let concurrency = {};
  await step("rate limit concurrency", async () => {
    const namespace = "concurrency-test";
    const pool = new pg.Pool({ ...connection, max: 12 });
    try {
      const start = performance.now();
      const results = await Promise.all(
        Array.from({ length: 20 }, () =>
          pool.query("select public.consume_rate_limit($1,$2,$3) as result", [namespace, "login_email_ip", "a".repeat(64)]),
        ),
      );
      assert.equal(results.filter((r) => r.rows[0].result.allowed).length, 5);
      const rows = await client.query("select count(*)::int as n from private.rate_limit_counters where namespace=$1", [namespace]);
      assert.equal(rows.rows[0].n, 1);
      concurrency = { concurrent_requests: 20, allowed: 5, counter_rows: 1, elapsed_ms: Math.round(performance.now() - start) };
    } finally {
      await pool.end();
    }
  });
  await step("types/database.ts sesuai schema", async () => {
    const diffs = compareSchema(await readCatalog(client), readTypes(readFileSync("types/database.ts", "utf8")));
    if (diffs.length) throw Error(`${diffs.length} selisih\n${diffs.join("\n")}`);
  });
  console.log(JSON.stringify({ database: "disposable", session_rls_audit: failures.length ? "FAIL" : "PASS", failures, ...concurrency }));
  if (failures.length) process.exitCode = 1;
} finally {
  if (client) await client.end();
  if (started) run("pg_ctl", ["-D", directory, "-m", "fast", "-w", "stop"]);
  console.log(`Disposable test directory retained: ${resolve(directory)}`);
}
