/**
 * Query dashboard admin (#53). Membaca tabel langsung lewat sesi admin (RLS, D13);
 * hitungan memakai head count sehingga tidak ada baris yang diunduh.
 */

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { databaseError } from "./errors";

type Client = SupabaseClient<Database>;

const HEAD_COUNT = { count: "exact", head: true } as const;
const RECENT_LIMIT = 5;

async function headCount(
  query: PromiseLike<{ count: number | null; error: PostgrestError | null }>,
) {
  const { count, error } = await query;
  if (error) databaseError(error);
  return count ?? 0;
}

/** Jumlah anggota berstatus tertentu yang belum di-soft delete (D14). */
export function countMembers(client: Client, status: "ACTIVE" | "ALUMNI") {
  return headCount(
    client
      .from("members")
      .select("id", HEAD_COUNT)
      .eq("status", status)
      .is("deleted_at", null),
  );
}

/** K1: pendaftaran yang masih menunggu keputusan admin. */
export function countPendingRegistrations(client: Client) {
  return headCount(
    client
      .from("registrations")
      .select("id", HEAD_COUNT)
      .in("status", ["SUBMITTED", "UNDER_REVIEW"]),
  );
}

/** K2: sama dengan grup "Pendaftaran Dibuka" di /competitions (lifecycle tersimpan, T06). */
export function countOpenCompetitions(client: Client) {
  return headCount(
    client
      .from("competitions")
      .select("id", HEAD_COUNT)
      .eq("status", "OPEN")
      .eq("publication_status", "PUBLISHED"),
  );
}

// old_values/new_values bisa memuat data pendaftar, jadi tidak pernah dipilih.
const AUDIT_ACTIVITY_FIELDS = "id,action,entity_type,created_at,actor:admins(name)";

/** Aktivitas admin terbaru dari `audit_logs`, tanpa payload perubahan. */
export async function listRecentAuditActivity(client: Client) {
  const { data, error } = await client
    .from("audit_logs")
    .select(AUDIT_ACTIVITY_FIELDS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(RECENT_LIMIT);
  if (error) databaseError(error);
  return data ?? [];
}

/** K3: pendaftaran terbaru; NIM, kontak, dan jawaban hanya ada di detail #29. */
export async function listRecentRegistrations(client: Client) {
  const { data, error } = await client
    .from("registrations")
    .select("id,full_name,status,submitted_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(RECENT_LIMIT);
  if (error) databaseError(error);
  return data ?? [];
}

/** K3: prestasi terbaru menurut tanggal prestasi, semua status publikasi. */
export async function listRecentAchievements(client: Client) {
  const { data, error } = await client
    .from("achievements")
    .select("id,title,ranking,achievement_date,publication_status")
    .order("achievement_date", { ascending: false })
    .order("id", { ascending: false })
    .limit(RECENT_LIMIT);
  if (error) databaseError(error);
  return data ?? [];
}

export type AuditActivityRow = Awaited<ReturnType<typeof listRecentAuditActivity>>[number];
export type RecentRegistrationRow = Awaited<ReturnType<typeof listRecentRegistrations>>[number];
export type RecentAchievementRow = Awaited<ReturnType<typeof listRecentAchievements>>[number];
