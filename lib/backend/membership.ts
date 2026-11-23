import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types/database";
import { AppError, databaseError } from "./errors";
import { calendarDateSchema, httpUrlSchema } from "./validation";

type Client = SupabaseClient<Database>;

// Nilai tersimpan (D04); normalisasi input "08…" milik phoneSchema di validation.ts (#33).
export const storedPhoneSchema = z.string().regex(/^\+[1-9][0-9]{7,14}$/);
// PostgREST mengembalikan timestamptz dengan offset (+00:00) dan mikrodetik.
const timestampSchema = z.iso.datetime({ offset: true });
// Referensi media, bukan URL (BACKEND_CONVENTIONS §140); maksimal 500 karakter.
export const photoSchema = z
  .string()
  .trim()
  .max(500)
  .refine((val) => !/^https?:\/\//i.test(val), {
    message: "Foto harus berupa referensi media, bukan URL eksternal.",
  })
  .optional()
  .nullable();

export const memberSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1).max(120),
  nim: z.string().min(5).max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: storedPhoneSchema.optional().nullable(),
  faculty: z.string().min(2).max(100).optional().nullable(),
  study_program: z.string().min(2).max(100).optional().nullable(),
  batch: z.number().int().optional().nullable(),
  photo: photoSchema,
  bio: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "ALUMNI"]),
  joined_at: timestampSchema.optional().nullable(),
  graduated_at: timestampSchema.optional().nullable(),
  linkedin_url: httpUrlSchema.optional().nullable(),
  github_url: httpUrlSchema.optional().nullable(),
  instagram_url: httpUrlSchema.optional().nullable(),
  public_profile: z.boolean().default(true),
  created_at: timestampSchema,
  updated_at: timestampSchema,
  deleted_at: timestampSchema.optional().nullable(),
});

export const membershipHistorySchema = z
  .object({
    id: z.string().uuid(),
    member_id: z.string().uuid(),
    organization_period_id: z.string().uuid(),
    department_id: z.string().uuid().optional().nullable(),
    position_id: z.string().uuid(),
    start_date: calendarDateSchema.optional().nullable(),
    end_date: calendarDateSchema.optional().nullable(),
    notes: z.string().optional().nullable(),
    created_at: timestampSchema,
    updated_at: timestampSchema,
  })
  .refine(
    (data) => !data.start_date || !data.end_date || data.end_date >= data.start_date,
    {
      message: "end_date harus setelah atau sama dengan start_date.",
      path: ["end_date"],
    },
  );

export const registrationStatusSchema = z.enum(["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED"]);

export const registrationSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1).max(120),
  nim: z.string().min(5).max(20),
  email: z.string().email(),
  phone: storedPhoneSchema,
  faculty: z.string().min(2).max(100),
  study_program: z.string().min(2).max(100),
  batch: z.number().int(),
  preferred_department_id: z.string().uuid().optional().nullable(),
  skills: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  motivation: z.string().optional().nullable(),
  portfolio_url: httpUrlSchema.optional().nullable(),
  photo: photoSchema,
  status: registrationStatusSchema.default("SUBMITTED"),
  admin_notes: z.string().optional().nullable(),
  submitted_at: timestampSchema,
  accepted_at: timestampSchema.optional().nullable(),
  rejected_at: timestampSchema.optional().nullable(),
  converted_member_id: z.string().uuid().optional().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export type Member = z.infer<typeof memberSchema>;
export type MembershipHistory = z.infer<typeof membershipHistorySchema>;
export type Registration = z.infer<typeof registrationSchema>;

/**
 * Soft delete member via SQL RPC (D13, D14, Issue #54).
 * Memeriksa sesi admin aktif, mengisi deleted_at, dan mencatat audit persisten secara atomik.
 */
export async function softDeleteMember(client: Client, memberId: string) {
  if (!z.string().uuid().safeParse(memberId).success) {
    throw new AppError("NOT_FOUND");
  }

  const { data, error } = await client.rpc("admin_soft_delete_member", {
    p_member_id: memberId,
  });

  if (error) databaseError(error);

  return data as { id: string; deleted: boolean };
}
