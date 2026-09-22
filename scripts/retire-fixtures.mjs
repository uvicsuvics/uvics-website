import { readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { target, operatorClient } from "./tooling.mjs";
if (process.argv[2] !== target())
  throw Error("Pass verified project ref explicitly");
const path = ".runtime/auth-fixtures.json";
const manifest = z
  .object({
    users: z.array(
      z.object({
        id: z.uuid(),
        email: z.string().regex(/^uvics-.*@example\.invalid$/),
        label: z.enum(["admin", "other-admin", "nonadmin"]),
      }),
    ),
  })
  .passthrough()
  .parse(JSON.parse(readFileSync(path, "utf8")));
const client = operatorClient();
for (const user of manifest.users) {
  const actual = await client.auth.admin.getUserById(user.id);
  if (actual.error || actual.data.user.email !== user.email)
    throw Error("Fixture identity mismatch; stopped");
  const profile = await client
    .from("admins")
    .update({ is_active: false })
    .eq("id", user.id);
  if (profile.error) throw Error("Fixture deactivation failed");
  const banned = await client.auth.admin.updateUserById(user.id, {
    ban_duration: "876000h",
  });
  if (banned.error) throw Error("Fixture Auth ban failed");
  console.log(JSON.stringify({ id: user.id, state: "inactive-and-banned" }));
}
manifest.retired_at = new Date().toISOString();
writeFileSync(path, JSON.stringify(manifest, null, 2));
