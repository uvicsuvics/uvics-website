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
    join(process.env.LOCALAPPDATA || "", "pgsql", "pgsql", "bin"),
    join(process.env.LOCALAPPDATA || "", "pgsql", "bin"),
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
    "tests/db/registration-conversion.sql",
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
  let convConcurrency = {};
  await step("registration conversion concurrency (idempotency guard)", async () => {
    const pool = new pg.Pool({ ...connection, max: 10 });
    try {
      await client.query("begin");
      const adminId = "00000000-0000-4000-8000-000000000001";
      const sessionId = "00000000-0000-4000-8000-000000000011";
      await client.query(
        "insert into auth.users (id) values ($1) on conflict (id) do nothing",
        [adminId],
      );
      await client.query(
        "insert into public.admins (id, name, is_active) values ($1, 'Admin', true) on conflict (id) do update set is_active=true",
        [adminId],
      );
      await client.query(
        "insert into auth.sessions (id, user_id, created_at) values ($1, $2, statement_timestamp()) on conflict (id) do nothing",
        [sessionId, adminId],
      );

      const dept = (
        await client.query(
          "insert into public.departments (name, slug) values ('Dept Conc', 'dept-conc') returning id",
        )
      ).rows[0].id;
      const pos = (
        await client.query(
          "insert into public.positions (name, level) values ('Pos Conc', 'Staff') returning id",
        )
      ).rows[0].id;
      const period = (
        await client.query(
          "insert into public.organization_periods (name, start_date, end_date, status) values ('2027/2028', '2027-08-01', '2028-07-31', 'UPCOMING') returning id",
        )
      ).rows[0].id;
      const reg = (
        await client.query(
          "insert into public.registrations (full_name, nim, email, phone, faculty, study_program, batch, status) values ('Calon Conc', '10502181999', 'conc@student.unklab.ac.id', '+6281234567999', 'FIK', 'Informatika', 2025, 'ACCEPTED') returning id",
        )
      ).rows[0].id;
      await client.query("commit");

      const start = performance.now();
      const jwtClaims = JSON.stringify({ sub: adminId, session_id: sessionId });
      const results = await Promise.allSettled(
        Array.from({ length: 10 }, async () => {
          const c = await pool.connect();
          try {
            await c.query(`select set_config('request.jwt.claims', $1, false)`, [jwtClaims]);
            return (
              await c.query(
                "select public.admin_convert_registration_to_member($1, $2, $3, $4, $5) as res",
                [reg, period, dept, pos, "2027-08-15"],
              )
            ).rows[0].res;
          } finally {
            await c.release();
          }
        }),
      );

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");
      assert.equal(fulfilled.length, 1, `Exactly 1 conversion should succeed; got ${fulfilled.length}`);
      assert.equal(rejected.length, 9, `9 conversions should fail with check_violation; got ${rejected.length}`);

      const memberCount = (
        await client.query("select count(*)::int as n from public.members where nim = '10502181999'")
      ).rows[0].n;
      assert.equal(memberCount, 1, "Exactly 1 member row must exist");

      const histCount = (
        await client.query(
          "select count(*)::int as n from public.membership_histories where organization_period_id = $1",
          [period],
        )
      ).rows[0].n;
      assert.equal(histCount, 1, "Exactly 1 membership_history row must exist");

      convConcurrency = {
        conversion_concurrency: 10,
        succeeded: 1,
        blocked: 9,
        elapsed_ms: Math.round(performance.now() - start),
      };
    } finally {
      await pool.end();
    }
  });
  await step("types/database.ts sesuai schema", async () => {
    const diffs = compareSchema(await readCatalog(client), readTypes(readFileSync("types/database.ts", "utf8")));
    if (diffs.length) throw Error(`${diffs.length} selisih\n${diffs.join("\n")}`);
  });
  console.log(JSON.stringify({ database: "disposable", session_rls_audit: failures.length ? "FAIL" : "PASS", failures, ...concurrency, ...convConcurrency }));
  if (failures.length) process.exitCode = 1;
} finally {
  if (client) await client.end();
  if (started) run("pg_ctl", ["-D", directory, "-m", "fast", "-w", "stop"]);
  console.log(`Disposable test directory retained: ${resolve(directory)}`);
}
