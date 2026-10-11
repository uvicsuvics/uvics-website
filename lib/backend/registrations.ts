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
 *   TIDAK boleh masuk DTO publik.
 *
 * Pola:
 *   Admin reads → SELECT langsung (RLS memfilter via has_active_admin_session)
 *   Mutations → fungsi SQL (admin_review_registration, admin_convert_registration_to_member)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/types/database";
import { normalizeSearch } from "./content";
import { AppError, databaseError } from "./errors";
import { calendarDateSchema, paginationMeta, paginationSchema } from "./validation";

type Client = SupabaseClient<Database>;

// ============================================================
// Zod Schemas — Input validation (Scope 1–6)
// ============================================================

/** Status yang valid untuk registrasi (Scope 2) */
export const registrationStatusEnum = z.enum([
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "REJECTED",
]);

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

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
  status: optional(registrationStatusEnum),
  /** Search nama atau NIM (opsional, min 2 karakter setelah normalisasi) */
  search: searchFilterSchema,
});

/**
 * Input schema untuk listing registrations (Scope 1, 2, 3)
 * Admin mengirim query params yang divalidasi Zod sebelum query database.
 * Pagination mengikuti contract di BACKEND_CONVENTIONS: page=1, page_size=20, max 100.
 */
export const registrationListInputSchema = paginationSchema.and(
  z.object({
    /** Filter berdasarkan status (opsional) */
    status: registrationStatusEnum.optional(),
    /** Search nama atau NIM (opsional, min 2 karakter) */
    search: z.string().min(2).max(120).optional(),
  }),
);

/**
 * Input schema untuk review registrasi (Scope 2, 3, 4)
 * Divalidasi sebelum memanggil admin_review_registration RPC.
 */
export const reviewRegistrationInputSchema = z.object({
  registration_id: z.string().uuid(),
  status: registrationStatusEnum,
  admin_notes: z.string().max(2000).nullable().optional(),
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
  /** Nullable: pengurus inti (Presiden, Sekretaris, dll) tanpa departemen (U01) */
  department_id: z.string().uuid().nullable(),
  position_id: z.string().uuid(),
  start_date: calendarDateSchema,
});

// ============================================================
// Type exports
// ============================================================

export type RegistrationStatus = z.infer<typeof registrationStatusEnum>;
export type RegistrationListInput = z.infer<
  typeof registrationListInputSchema
>;
export type RegistrationFilter = z.infer<typeof registrationFilterSchema>;
export type ReviewRegistrationInput = z.infer<
  typeof reviewRegistrationInputSchema
>;
export type ConvertRegistrationInput = z.infer<
  typeof convertRegistrationInputSchema
>;

// ============================================================
// Proyeksi Field & Query Helpers
// ============================================================

const ADMIN_REGISTRATION_FIELDS =
  "id,full_name,nim,email,phone,faculty,study_program,batch,preferred_department_id,skills,experience,motivation,portfolio_url,photo,status,admin_notes,submitted_at,accepted_at,rejected_at,converted_member_id,created_at,updated_at";

function parseQuery<T extends z.ZodType>(schema: T, raw: unknown): z.infer<T> {
  const result = schema.safeParse(raw);
  if (!result.success) throw new AppError("VALIDATION_ERROR");
  return result.data;
}

const rangeOf = ({ page, page_size }: { page: number; page_size: number }) =>
  [(page - 1) * page_size, page * page_size - 1] as const;

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
    .select(ADMIN_REGISTRATION_FIELDS, { count: "exact" });

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
    .select(ADMIN_REGISTRATION_FIELDS)
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
 */
export async function reviewRegistration(client: Client, raw: unknown) {
  const input = parseQuery(reviewRegistrationInputSchema, raw);

  const { data, error } = await client.rpc("admin_review_registration", {
    p_registration_id: input.registration_id,
    p_status: input.status,
    p_admin_notes: input.admin_notes ?? (null as unknown as string),
  });

  if (error) databaseError(error);

  return data as { id: string; status: RegistrationStatus };
}

/**
 * Operasi aman Accept pendaftaran (Scope 4).
 */
export async function acceptRegistration(
  client: Client,
  registrationId: string,
  adminNotes?: string | null,
) {
  return reviewRegistration(client, {
    registration_id: registrationId,
    status: "ACCEPTED",
    admin_notes: adminNotes ?? null,
  });
}

/**
 * Operasi aman Reject pendaftaran (Scope 4).
 */
export async function rejectRegistration(
  client: Client,
  registrationId: string,
  adminNotes?: string | null,
) {
  return reviewRegistration(client, {
    registration_id: registrationId,
    status: "REJECTED",
    admin_notes: adminNotes ?? null,
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
      p_department_id: input.department_id as string,
      p_position_id: input.position_id,
      p_start_date: input.start_date,
    },
  );

  if (error) databaseError(error);

  return data as {
    member_id: string;
    membership_history_id: string;
    registration_id: string;
  };
}

