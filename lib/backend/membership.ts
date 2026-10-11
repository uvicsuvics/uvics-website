import { z } from "zod";
import { httpUrlSchema } from "./validation";

// Nilai tersimpan (D04); normalisasi input "08…" milik phoneSchema di validation.ts (#33).
export const storedPhoneSchema = z.string().regex(/^\+[1-9][0-9]{7,14}$/);
// PostgREST mengembalikan timestamptz dengan offset (+00:00) dan mikrodetik.
const timestampSchema = z.iso.datetime({ offset: true });
// Referensi media, bukan URL (BACKEND_CONVENTIONS); bentuknya ditetapkan alur upload #28/#29.
const photoSchema = z.string().optional().nullable();

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

export const membershipHistorySchema = z.object({
  id: z.string().uuid(),
  member_id: z.string().uuid(),
  organization_period_id: z.string().uuid(),
  department_id: z.string().uuid(),
  position_id: z.string().uuid(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

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
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED"]).default("SUBMITTED"),
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
