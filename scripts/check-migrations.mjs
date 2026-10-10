import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DIR = "supabase/migrations/";
const NAME = /^\d{14}_[a-z0-9_]+\.sql$/;

/** Migration yang sudah ada di base bersifat append-only (DEVELOPMENT_WORKFLOW §9). */
export function checkMigrations(changes, baseFiles) {
  const latest = [...baseFiles].sort().at(-1) ?? "";
  const errors = [];
  for (const { status, file } of changes) {
    if (!file.startsWith(DIR)) continue;
    const name = file.slice(DIR.length);
    if (status !== "A") errors.push(`${file}: migration yang sudah ada tidak boleh diubah, dihapus, atau di-rename (${status})`);
    else if (!NAME.test(name)) errors.push(`${file}: nama harus YYYYMMDDHHMMSS_topik.sql`);
    else if (name <= latest) errors.push(`${file}: harus diurutkan setelah ${latest}`);
  }
  return errors;
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const lines = (text) => text.split("\n").filter(Boolean);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const base = process.argv[2] || process.env.MIGRATION_BASE || "origin/development";
  const mergeBase = git("merge-base", base, "HEAD");
  const changes = lines(git("diff", "--name-status", "--no-renames", mergeBase, "HEAD", "--", DIR)).map((line) => {
    const [status, file] = line.split("\t");
    return { status, file };
  });
  const baseFiles = lines(git("ls-tree", "--name-only", mergeBase, DIR)).map((f) => f.slice(DIR.length));
  const errors = checkMigrations(changes, baseFiles);
  console.log(`check:migrations base=${base} (${mergeBase.slice(0, 7)}), ${changes.length} perubahan`);
  for (const e of errors) console.error(e);
  if (errors.length) process.exitCode = 1;
}
