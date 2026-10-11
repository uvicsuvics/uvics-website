import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { AppError, databaseError } from "@/lib/backend/errors";
import type { AdminIdentity } from "./login";
import type { Database } from "@/types/database";
export async function requireAdmin(
  client: SupabaseClient<Database>,
): Promise<AdminIdentity> {
  const { data: user, error: userError } = await client.auth.getUser();
  if (userError) {
    if (userError.status && userError.status < 500)
      throw new AppError("UNAUTHENTICATED");
    throw new AppError("SERVICE_UNAVAILABLE");
  }
  if (!user.user) throw new AppError("UNAUTHENTICATED");
  const { data: claims, error: claimsError } = await client.auth.getClaims();
  if (claimsError && (!claimsError.status || claimsError.status >= 500))
    throw new AppError("SERVICE_UNAVAILABLE");
  if (claimsError || !claims) throw new AppError("UNAUTHENTICATED");
  const sid = z.uuid().safeParse(claims.claims.session_id);
  if (!sid.success) throw new AppError("UNAUTHENTICATED");
  const { data: allowed, error } = await client.rpc("has_active_admin_session");
  if (error) throw new AppError("SERVICE_UNAVAILABLE");
  if (allowed !== true) throw new AppError("FORBIDDEN");
  const { data: admin, error: profileError } = await client
    .from("admins")
    .select("id,name")
    .eq("id", user.user.id)
    .single();
  if (profileError) databaseError(profileError);
  if (!admin) throw new AppError("FORBIDDEN");
  return { id: admin.id, name: admin.name, sessionId: sid.data };
}
