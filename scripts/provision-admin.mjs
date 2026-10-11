import { input, password, confirm } from "@inquirer/prompts";
import { readFileSync, realpathSync } from "node:fs";
import { resolve, sep } from "node:path";
import { z } from "zod";
import { operatorClient, target } from "./tooling.mjs";

// Mode file hanya untuk input operator lokal yang tidak boleh masuk Git/log.
const args = process.argv.slice(2);
let identity;
if (args.length) {
  if (
    args.length !== 4 ||
    args[0] !== "--from-file" ||
    args[2] !== "--project" ||
    args[3] !== target()
  ) {
    throw Error(
      "Use --from-file .runtime/<identity>.json --project <verified-ref>",
    );
  }
  const localPath = realpathSync(resolve(args[1]));
  if (!localPath.startsWith(realpathSync(".runtime") + sep)) {
    throw Error("Identity file must stay in ignored .runtime directory");
  }
  let contents;
  try {
    contents = JSON.parse(readFileSync(localPath, "utf8"));
  } catch {
    throw Error("Cannot read operator identity JSON; contents not logged");
  }
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(120),
      email: z.email().trim().toLowerCase(),
      password: z.string().min(12).max(1024),
    })
    .strict()
    .safeParse(contents);
  if (!parsed.success)
    throw Error("Invalid operator identity; values not logged");
  identity = parsed.data;
}
const client = operatorClient();
console.log(`Provisioning admin on project ${target()}.`);
const name = (
  identity?.name ??
  (await input({
    message: "Nama admin:",
    validate: (v) => v.trim().length > 0 && v.trim().length <= 120,
  }))
).trim();
const email = (
  identity?.email ??
  (await input({
    message: "Email admin:",
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  }))
)
  .trim()
  .toLowerCase();
for (let page = 1; ; page++) {
  const { data, error } = await client.auth.admin.listUsers({
    page,
    perPage: 100,
  });
  if (error) throw Error("Cannot verify existing accounts.");
  const existing = data.users.find((u) => u.email?.toLowerCase() === email);
  if (existing) {
    console.log(
      "Identitas sudah ada. Tidak membuat, mereset password, atau mempromosikan akun. Periksa profil melalui jalur operator.",
    );
    process.exit(0);
  }
  if (data.users.length < 100) break;
}
const secret =
  identity?.password ??
  (await password({
    message: "Password admin (tersembunyi, minimal 12 karakter):",
    mask: true,
    validate: (v) => v.length >= 12 && v.length <= 1024,
  }));
if (
  !identity &&
  !(await confirm({
    message: `Buat identitas admin pada project ${target()}?`,
    default: false,
  }))
)
  process.exit(0);
const { data, error } = await client.auth.admin.createUser({
  email,
  password: secret,
  email_confirm: true,
});
if (error || !data.user)
  throw Error("Pembuatan identitas gagal; tidak ada credential dicetak.");
const { error: profileError } = await client
  .from("admins")
  .insert({ id: data.user.id, name, is_active: true });
if (profileError) {
  console.error(
    `Profil admin gagal dibuat. Identitas Auth ${data.user.id} belum diberi akses; jangan ulangi dengan akun baru. Operator perlu rekonsiliasi ID ini.`,
  );
  process.exitCode = 1;
} else console.log(`Admin berhasil diprovisikan: ${data.user.id}.`);
