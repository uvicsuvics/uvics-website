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

import { z } from "zod";

import { calendarDateSchema, paginationSchema } from "./validation";

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
export type ReviewRegistrationInput = z.infer<
  typeof reviewRegistrationInputSchema
>;
export type ConvertRegistrationInput = z.infer<
  typeof convertRegistrationInputSchema
>;
