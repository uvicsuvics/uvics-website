"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { loginAdmin } from "@/lib/auth/login";
import { AppError, toFailure } from "@/lib/backend/errors";
import { assertOrigin, trustedIp } from "@/lib/backend/request";
import { appOrigin } from "@/lib/env/server";
import { limitLogin } from "@/lib/backend/rate-limit";
export async function loginAction(input: unknown) {
  try {
    const h = await headers();
    assertOrigin(h.get("origin"), appOrigin());
    const ip = trustedIp(h, appOrigin(), process.env.VERCEL === "1");
    const client = await serverClient(true);
    await loginAdmin(input, {
      limit: (email) => limitLogin(email, ip),
      async authenticate(credentials) {
        const { error } = await client.auth.signInWithPassword(credentials);
        if (error) {
          if (error.status === 429) throw new AppError("RATE_LIMITED");
          if (!error.status || error.status >= 500)
            throw new AppError("SERVICE_UNAVAILABLE");
          throw new AppError("INVALID_CREDENTIALS");
        }
      },
      authorize: () => requireAdmin(client),
      async audit() {
        const { error } = await client.rpc("record_admin_login");
        if (error) throw new AppError("SERVICE_UNAVAILABLE");
      },
      async revoke() {
        const { error } = await client.auth.signOut({ scope: "local" });
        if (error) throw new AppError("SERVICE_UNAVAILABLE");
      },
    });
  } catch (error) {
    return toFailure(error);
  }
  redirect("/admin/dashboard");
}
export async function logoutAction() {
  try {
    assertOrigin((await headers()).get("origin"), appOrigin());
    const client = await serverClient(true);
    // Sesi yang melewati deadline tetap dapat dicabut; tidak perlu hak admin untuk signOut sesi sendiri.
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw new AppError("SERVICE_UNAVAILABLE");
  } catch (error) {
    return toFailure(error);
  }
  redirect("/admin/login");
}
