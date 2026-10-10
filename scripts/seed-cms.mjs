import { readFileSync } from "node:fs";
import { psql, target } from "./tooling.mjs";

if (process.argv[2] !== target())
  throw Error("Usage: node scripts/seed-cms.mjs <verified-project-ref>");

psql(readFileSync(new URL("./seed-cms.sql", import.meta.url), "utf8"));
console.log(JSON.stringify({ target: target(), status: "cms-seeded" }));
