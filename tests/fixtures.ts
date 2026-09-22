import { readFileSync } from "node:fs";
import { z } from "zod";
export function authFixtures() {
  const manifest = z
    .object({
      users: z.array(
        z.object({ id: z.uuid(), label: z.string(), email: z.email() }),
      ),
    })
    .parse(JSON.parse(readFileSync(".runtime/auth-fixtures.json", "utf8")));
  const credentials = z
    .object({
      users: z.array(z.object({ id: z.uuid(), password: z.string() })),
    })
    .parse(JSON.parse(readFileSync(".runtime/auth-credentials.json", "utf8")));
  return {
    users: manifest.users.map((user) => {
      const secret = credentials.users.find((item) => item.id === user.id);
      if (!secret) throw Error("Missing local synthetic credential");
      return { ...user, password: secret.password };
    }),
  };
}
