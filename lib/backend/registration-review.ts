/**
 * Registration Admin Queries & Mutation Wrappers
 *
 * Scope (Issue #29 — S2-BE-02):
 *   1. Listing registrations dengan pagination (BACKEND_CONVENTIONS §pagination)
 *   2. Filter status (SUBMITTED | UNDER_REVIEW | ACCEPTED | REJECTED)
 *   3. Search nama/NIM
 *   4. View detail (admin-only, semua kolom)
 *   5. Review registration (status + admin_notes) via SQL RPC (D13)
 *   6. Convert ACCEPTED → Member ACTIVE via SQL RPC (D12, D13)
 *
 * Privacy (BACKEND_CONVENTIONS §DTO):
 *   admin_notes, NIM, email, phone, motivation, experience
 *   TIDAK boleh masuk DTO publik. Listing admin hanya memakai proyeksi #31.
 *
 * Pola:
 *   Admin reads → SELECT langsung (RLS memfilter via has_active_admin_session)
 *   Mutations → fungsi SQL (admin_review_registration, admin_convert_registration_to_member)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/types/database";
import { normalizeSearch, optional, parseQuery, rangeOf } from "./content";
import { AppError, databaseError } from "./errors";
import { registrationStatusSchema } from "./membership";
import { calendarDateSchema, paginationMeta, paginationSchema } from "./validation";

type Client = SupabaseClient<Database>;

// ============================================================
// Zod Schemas — Input validation (Scope 1–6)
// ============================================================

const searchFilterSchema = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z
    .string()
    .max(120)
    .optional()
    .transform((v) => (v ? normalizeSearch(v) : "") || undefined)
    .refine((v) => !v || v.length >= 2, {
      message: "Pencarian minimal 2 karakter.",
    }),
);

export const registrationFilterSchema = z.object({
  /** Filter berdasarkan status (opsional) */
  status: optional(registrationStatusSchema),
  /** Search nama atau NIM (opsional, min 2 karakter setelah normalisasi) */
  search: searchFilterSchema,
});

/**
 * Input schema untuk review registrasi (Scope 2, 3, 4)
 * Divalidasi sebelum memanggil admin_review_registration RPC.
 * admin_notes tidak dikirim → catatan dipertahankan; string kosong → catatan dihapus.
 */
export const reviewRegistrationInputSchema = z.object({
  registration_id: z.string().uuid(),
  status: registrationStatusSchema,
  admin_notes: z.string().trim().max(2000).optional(),
});

/**
 * Input schema untuk konversi registrasi → member (Scope 5)
 * Divalidasi sebelum memanggil admin_convert_registration_to_member RPC.
 * start_date menggunakan calendarDateSchema (YYYY-MM-DD).
 * department_id nullable: pengurus inti tanpa departemen (U01).
 */
export const convertRegistrationInputSchema = z.object({
  registration_id: z.string().uuid(),
  organization_period_id: z.string().uuid(),
  /** Nullable: core team (President, Treasurer, Secretary) tanpa departemen (U01) */
  department_id: z.string().uuid().nullable(),
  position_id: z.string().uuid(),
  start_date: calendarDateSchema,
});

// ============================================================
// Type exports
// ============================================================

/** Status lifecycle registration; berbeda dari `RegistrationStatus` hasil submit publik (#28). */
export type RegistrationReviewStatus = z.infer<typeof registrationStatusSchema>;
export type RegistrationFilter = z.infer<typeof registrationFilterSchema>;
export type ReviewRegistrationInput = z.infer<
  typeof reviewRegistrationInputSchema
>;
export type ConvertRegistrationInput = z.infer<
  typeof convertRegistrationInputSchema
>;

// ============================================================
// Proyeksi Field
// ============================================================

// Proyeksi listing kontrak #31; kontak, jawaban, dan catatan hanya di detail.
const ADMIN_REGISTRATION_LIST_FIELDS =
  "id,full_name,nim,study_program,batch,preferred_department_id,status,submitted_at";

const ADMIN_REGISTRATION_DETAIL_FIELDS =
  "id,full_name,nim,email,phone,faculty,study_program,batch,preferred_department_id,skills,experience,motivation,portfolio_url,photo,status,admin_notes,submitted_at,accepted_at,rejected_at,converted_member_id,consent_at,created_at,updated_at";

// ============================================================
// Domain Queries (Scope 1, Privacy: Admin Only)
// ============================================================

/**
 * Listing pendaftaran untuk admin dengan filter status, search nama/NIM, dan paginasi standar.
 */
export async function listAdminRegistrations(client: Client, raw: unknown) {
  const pagination = parseQuery(paginationSchema, raw);
  const filter = parseQuery(registrationFilterSchema, raw);

  let query = client
    .from("registrations")
    .select(ADMIN_REGISTRATION_LIST_FIELDS, { count: "exact" });

  if (filter.status) {
    query = query.eq("status", filter.status);
  }

  if (filter.search) {
    query = query.or(
      `full_name.ilike.%${filter.search}%,nim.ilike.%${filter.search}%`,
    );
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(...rangeOf(pagination));

  if (error) databaseError(error);

  return {
    items: data ?? [],
    pagination: paginationMeta(pagination.page, pagination.page_size, count ?? 0),
  };
}

/**
 * Mengambil detail lengkap pendaftaran berdasarkan ID (Admin Only).
 */
export async function getAdminRegistrationById(client: Client, id: string) {
  if (!z.string().uuid().safeParse(id).success) {
    throw new AppError("NOT_FOUND");
  }

  const { data, error } = await client
    .from("registrations")
    .select(ADMIN_REGISTRATION_DETAIL_FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error) databaseError(error);
  if (!data) throw new AppError("NOT_FOUND");

  return data;
}

// ============================================================
// Domain Mutations (Scope 2–5)
// ============================================================

/**
 * Review pendaftaran: ubah status dan catatan internal admin via SQL RPC (D13).
 * Transisi: SUBMITTED → UNDER_REVIEW → ACCEPTED | REJECTED; selain itu CONFLICT.
 */
export async function reviewRegistration(client: Client, raw: unknown) {
  const input = parseQuery(reviewRegistrationInputSchema, raw);

  const { data, error } = await client.rpc("admin_review_registration", {
    p_registration_id: input.registration_id,
    p_status: input.status,
    p_admin_notes: input.admin_notes,
  });

  if (error) databaseError(error);

  return data as { id: string; status: RegistrationReviewStatus };
}

/**
 * Operasi aman Accept pendaftaran (Scope 4). Registrasi harus berstatus UNDER_REVIEW.
 */
export async function acceptRegistration(
  client: Client,
  registrationId: string,
  adminNotes?: string,
) {
  return reviewRegistration(client, {
    registration_id: registrationId,
    status: "ACCEPTED",
    admin_notes: adminNotes,
  });
}

/**
 * Operasi aman Reject pendaftaran (Scope 4). Registrasi harus berstatus UNDER_REVIEW.
 */
export async function rejectRegistration(
  client: Client,
  registrationId: string,
  adminNotes?: string,
) {
  return reviewRegistration(client, {
    registration_id: registrationId,
    status: "REJECTED",
    admin_notes: adminNotes,
  });
}

/**
 * Konversi pendaftar ACCEPTED menjadi Member ACTIVE via SQL RPC (D12, D13, U01).
 */
export async function convertRegistrationToMember(client: Client, raw: unknown) {
  const input = parseQuery(convertRegistrationInputSchema, raw);

  const { data, error } = await client.rpc(
    "admin_convert_registration_to_member",
    {
      p_registration_id: input.registration_id,
      p_organization_period_id: input.organization_period_id,
      p_position_id: input.position_id,
      p_start_date: input.start_date,
      p_department_id: input.department_id ?? undefined,
    },
  );

  if (error) databaseError(error);

  return data as {
    member_id: string;
    membership_history_id: string;
    registration_id: string;
  };
}
