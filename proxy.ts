import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/src/lib/env/public";
import { appOrigin } from "@/src/lib/env/server";
import {
  PRIVATE_HEADERS,
  httpFailure,
  AppError,
} from "@/src/lib/backend/errors";
import { assertOrigin } from "@/src/lib/backend/request";
import type { Database } from "@/types/database";
export async function proxy(request: NextRequest) {
  // Tolak mutasi lintas origin sebelum refresh token atau efek provider lain.
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    try {
      assertOrigin(request.headers.get("origin"), appOrigin());
    } catch (error) {
      return httpFailure(error);
    }
  }
  const env = publicEnv();
  let response = NextResponse.next({ request });
  const headers = new Headers(PRIVATE_HEADERS);
  const supabase = createServerClient<Database>(env.url, env.key, {
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        }),
    },
    cookieOptions: {
      secure: appOrigin().startsWith("https:"),
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values, cacheHeaders) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        const previous = response.cookies.getAll();
        response = NextResponse.next({ request });
        previous.forEach((c) => response.cookies.set(c));
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, { ...options, domain: undefined }),
        );
        Object.entries(cacheHeaders).forEach(([key, value]) =>
          headers.set(key, value),
        );
      },
    },
  });
  // Ini refresh transport; keputusan akses tetap pada DAL/RLS setiap request.
  try {
    const { error } = await supabase.auth.getClaims();
    if (error && (!error.status || error.status >= 500))
      return httpFailure(new AppError("SERVICE_UNAVAILABLE"));
  } catch {
    return httpFailure(new AppError("SERVICE_UNAVAILABLE"));
  }
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
