"use client";
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database";
export function browserClient() {
  const env = publicEnv();
  return createBrowserClient<Database>(env.url, env.key, {
    cookieOptions: {
      sameSite: "lax",
      path: "/",
      secure: window.location.protocol === "https:",
    },
  });
}
