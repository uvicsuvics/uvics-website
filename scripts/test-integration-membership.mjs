import pg from "pg";
import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

const directory = mkdtempSync(join(tmpdir(), "uvics-integration-"));
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

const port = Number(process.env.INTEGRATION_PG_PORT || 55439);

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
  run("initdb", [
    "-D", directory,
    "-U", "postgres",
    "--auth=trust",
    "--encoding=UTF8",
    "--no-locale",
  ]);

  writeFileSync(
    join(directory, "pg_hba.conf"),
    "local all all trust\nhost all all 127.0.0.1/32 trust\n",
  );

  run("pg_ctl", [
    "-D", directory,
    "-l", join(directory, "server.log"),
    "-o", `-p ${port} -h 127.0.0.1`,
    "-w", "start",
  ]);
  started = true;

  client = new pg.Client({ host: "127.0.0.1", port, database: "postgres", user: "postgres" });
  await client.connect();

  // 1. Apply bootstrap and PR #16 migrations
  await client.query(readFileSync("tests/db/bootstrap.sql", "utf8"));
  for (const file of readdirSync("supabase/migrations")
    .filter((x) => x.endsWith(".sql"))
    .sort()) {
    await client.query(readFileSync(join("supabase/migrations", file), "utf8"));
  }

  // 2. Fetch original PR #17 migration from origin/feature/membership-foundation
  let pr17OriginalSql = "";
  try {
    pr17OriginalSql = execSync(
      "git show origin/feature/membership-foundation:supabase/migrations/20260922120000_membership_foundation.sql",
      { encoding: "utf8" },
    );
  } catch (err) {
    throw Error(`Failed to fetch PR #17 migration: ${err.message}`);
  }

  // 3. Test unaligned PR #17 migration: expect failure on non-existent column "period_id"
  let unalignedFailed = false;
  let unalignedErrorMessage = "";
  try {
    await client.query("BEGIN;");
    await client.query(pr17OriginalSql);
    await client.query("COMMIT;");
  } catch (err) {
    unalignedFailed = true;
    unalignedErrorMessage = err.message;
    await client.query("ROLLBACK;");
  }

  assert.equal(
    unalignedFailed,
    true,
    "Expected unaligned PR #17 migration to fail due to period_id rename mismatch",
  );
  assert.match(
    unalignedErrorMessage,
    /period_id/,
    "Error message must indicate missing period_id column/constraint",
  );

  // 4. Test aligned PR #17 migration
  // In the aligned version, the redundant rename and drop constraint on period_id are removed,
  // preserving the canonical organization_period_id column already established by PR #16.
  const pr17AlignedSql = pr17OriginalSql
    .replace(
      "alter table public.membership_histories rename column period_id to organization_period_id;\n",
      "-- [ALIGNED] canonical organization_period_id already defined in PR #16\n",
    )
    .replace(
      "alter table public.membership_histories drop constraint membership_histories_period_id_fkey;\n",
      "-- [ALIGNED] constraint membership_histories_organization_period_id_fkey already established\n",
    )
    .replace(
      "alter table public.membership_histories add constraint membership_histories_organization_period_id_fkey foreign key (organization_period_id) references public.organization_periods(id) on delete restrict;\n",
      "-- [ALIGNED] foreign key already active on organization_period_id\n",
    );

  await client.query("BEGIN;");
  await client.query(pr17AlignedSql);
  await client.query("COMMIT;");

  // 5. Verify referential integrity and schemas under aligned migration
  const checkColumns = await client.query(`
    select column_name
    from information_schema.columns
    where table_name = 'membership_histories' and column_name in ('period_id', 'organization_period_id')
  `);
  const columns = checkColumns.rows.map((r) => r.column_name);
  assert.equal(columns.includes("organization_period_id"), true);
  assert.equal(columns.includes("period_id"), false);

  const checkRegistrations = await client.query(`
    select exists(select from pg_tables where tablename = 'registrations') as exists
  `);
  assert.equal(checkRegistrations.rows[0].exists, true);

  // 6. Test insertion across joined entities (Department, Position, Period, Member, History)
  await client.query(`
    do $$
    declare
      d uuid;
      p uuid;
      o uuid;
      m uuid;
      h uuid;
    begin
      insert into public.departments (name, slug) values ('Test Dept', 'test-dept') returning id into d;
      insert into public.positions (name, level) values ('Test Pos', 'Staff') returning id into p;
      insert into public.organization_periods (name, start_date, end_date, status)
      values ('2026/2027', '2026-08-01', '2027-07-31', 'UPCOMING') returning id into o;
      insert into public.members (full_name, nim, email, batch)
      values ('Test Member', '10501234', 'test@example.com', 2024) returning id into m;

      insert into public.membership_histories (member_id, organization_period_id, department_id, position_id)
      values (m, o, d, p) returning id into h;
    end$$;
  `);

  console.log(
    JSON.stringify({
      scenario: "Organization + Membership Integration",
      pr16_organization_contract: "CANONICAL (organization_period_id)",
      pr17_unaligned_migration_test: "FAILED_AS_EXPECTED",
      unaligned_error: unalignedErrorMessage,
      pr17_aligned_migration_test: "PASS",
      referential_integrity: "VERIFIED",
      status: "DEPENDENCY_BLOCKER_IDENTIFIED",
    }),
  );
} finally {
  if (client) await client.end();
  if (started) run("pg_ctl", ["-D", directory, "-m", "fast", "-w", "stop"]);
}
