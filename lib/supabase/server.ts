import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env/public";
import { appOrigin } from "@/lib/env/server";
import type { Database } from "@/types/database";
export async function serverClient(writable = false) {
  const jar = await cookies();
  const env = publicEnv();
  return createServerClient<Database>(env.url, env.key, {
    cookieOptions: {
      secure: appOrigin().startsWith("https:"),
      sameSite: "lax",
      path: "/",
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        }),
    },
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        // Server Components tidak menulis cookie; Proxy melakukan refresh sebelum render.
        // Actions/handlers meminta writable=true dan tidak menelan error penulisan cookie.
        if (writable)
          values.forEach(({ name, value, options }) =>
            jar.set(name, value, { ...options, domain: undefined }),
          );
      },
    },
  });
}
