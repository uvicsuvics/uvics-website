import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AppError,
  toFailure,
  type OperationResult,
} from "@/lib/backend/errors";
import { serverClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

/**
 * Jalankan mutasi admin lewat fungsi backend #30 (requireAdmin + Zod + RPC ter-audit).
 * Sukses me-refresh route modul beserta route di bawahnya (daftar dan halaman edit);
 * galat apa pun menjadi hasil aman `toFailure`.
 */
export async function mutate<T>(
  path: string,
  run: (client: Client) => Promise<T>,
): Promise<OperationResult<T>> {
  try {
    // Writable: Server Action boleh menulis cookie sesi yang diperbarui Supabase.
    const data = await run(await serverClient(true));
    revalidatePath(path, "layout");
    return { ok: true, data };
  } catch (error) {
    return toFailure(error);
  }
}

/**
 * Muat data admin untuk Server Component. Sesi yang hilang atau bukan admin diarahkan ke login
 * (seperti requirePageAdmin); galat lain dikembalikan sebagai hasil aman untuk ErrorState.
 */
export async function loadForAdmin<T>(
  load: (client: Client) => Promise<T>,
): Promise<OperationResult<T>> {
  let result: OperationResult<T>;
  try {
    result = { ok: true, data: await load(await serverClient()) };
  } catch (error) {
    if (
      error instanceof AppError &&
      (error.code === "UNAUTHENTICATED" || error.code === "FORBIDDEN")
    )
      redirect("/admin/login");
    result = toFailure(error);
  }
  return result;
}
