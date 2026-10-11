import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolveDatabaseTarget, redactCredentials } from "./tooling.mjs";

let targetInfo;
try {
  targetInfo = resolveDatabaseTarget();
} catch (err) {
  const redacted = redactCredentials(err.message, [
    process.env.SUPABASE_DB_PASSWORD,
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ]);
  console.error(`Target verification failed: ${redacted}`);
  process.exit(1);
}

const dbUrl = targetInfo.url;
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
  diagnostic = redactCredentials(diagnostic, [
    dbUrl.toString(),
    dbUrl.password,
    process.env.SUPABASE_DB_PASSWORD,
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ]);
  console.error(diagnostic.slice(-1800));
  process.exitCode = 1;
} else {
  mkdirSync("types", { recursive: true });
  writeFileSync("types/database.ts", result.stdout);
  if (targetInfo.kind === "local_disposable") {
    console.log("Database types generated from local disposable target public schema.");
  } else {
    console.log(`Database types generated from verified target ${targetInfo.targetRef} public schema.`);
  }
}
