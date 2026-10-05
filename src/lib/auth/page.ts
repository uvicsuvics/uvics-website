import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverClient } from "@/src/lib/supabase/server";
import { requireAdmin } from "./admin";
import { AppError } from "@/src/lib/backend/errors";
// React cache hanya deduplikasi satu render/request, bukan keputusan lintas sesi.
export const requirePageAdmin = cache(async () => {
  try {
    return await requireAdmin(await serverClient());
  } catch (error) {
    if (
      error instanceof AppError &&
      ["UNAUTHENTICATED", "FORBIDDEN"].includes(error.code)
    )
      redirect("/admin/login");
    throw error;
  }
});
