import nextEnv from "@next/env";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
nextEnv.loadEnvConfig(process.cwd());
export function required(name) {
  const v = process.env[name];
  if (!v) throw Error(`Missing ${name}`);
  return v;
}
export function target() {
  const ref = required("SUPABASE_PROJECT_REF");
  const url = new URL(required("NEXT_PUBLIC_SUPABASE_URL"));
  if (url.hostname !== `${ref}.supabase.co`)
    throw Error("Project URL/ref mismatch");
  return ref;
}
export function operatorClient() {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    process.env.SUPABASE_SECRET_KEY || required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export function psql(sql) {
  const binary =
    process.env.PSQL_BIN ||
    (process.platform === "win32"
      ? "C:/Program Files/PostgreSQL/17/bin/psql.exe"
      : "psql");
  const r = spawnSync(
    binary,
    ["-X", "--no-password", "-v", "ON_ERROR_STOP=1", "-At"],
    {
      input: sql,
      encoding: "utf8",
      windowsHide: true,
      timeout: 60000,
      env: {
        ...process.env,
        PGHOST: `db.${target()}.supabase.co`,
        PGPORT: "5432",
        PGDATABASE: "postgres",
        PGUSER: "postgres",
        PGPASSWORD: required("SUPABASE_DB_PASSWORD"),
        PGSSLMODE: "require",
        PGCONNECT_TIMEOUT: "10",
      },
    },
  );
  if (r.status !== 0) {
    const code =
      r.stderr.match(/ERROR:\s+([^\r\n]+)/)?.[1] ||
      "PostgreSQL operation failed";
    throw Error(code);
  }
  return r.stdout;
}
