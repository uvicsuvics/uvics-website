import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { required, target } from "./tooling.mjs";
const pooler = process.env.SUPABASE_DB_POOLER_HOST;
if (pooler && !/^[a-z0-9-]+\.pooler\.supabase\.com$/.test(pooler))
  throw Error("Invalid official pooler host");
const dbUrl = new URL(
  `postgresql://${pooler ? "postgres." + target() : "postgres"}@${pooler || "db." + target() + ".supabase.co"}:5432/postgres`,
);
dbUrl.password = required("SUPABASE_DB_PASSWORD");
dbUrl.searchParams.set("sslmode", "require");
const result = spawnSync(
  process.execPath,
  [
    "node_modules/supabase/dist/supabase.js",
    "gen",
    "types",
    "--db-url",
    dbUrl.toString(),
    "--schema",
    "public",
    "--lang",
    "typescript",
  ],
  { encoding: "utf8", windowsHide: true, timeout: 60000 },
);
if (result.status !== 0 || !result.stdout.includes("export type Database")) {
  let diagnostic = result.stderr || String(result.error || "No output");
  for (const value of [
    required("SUPABASE_DB_PASSWORD"),
    encodeURIComponent(required("SUPABASE_DB_PASSWORD")),
    dbUrl.toString(),
  ])
    diagnostic = diagnostic.split(value).join("[REDACTED]");
  console.error(diagnostic.slice(-1800));
  process.exitCode = 1;
} else {
  mkdirSync("types", { recursive: true });
  const patchedStdout = result.stdout.replace(
    /\[_ in never\]: never/g,
    "[key: string]: never"
  );
  writeFileSync("types/database.ts", patchedStdout);
  console.log("Database types generated from verified target public schema.");
}
