import { z } from "zod";

// Nilai tersimpan (D04); normalisasi input "08…" milik phoneSchema di validation.ts (#33).
const storedPhoneSchema = z.string().regex(/^\+[1-9][0-9]{7,14}$/);

export const memberSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1).max(120),
  nim: z.string().min(5).max(20),
  email: z.string().email(),
  phone: storedPhoneSchema.optional().nullable(),
  faculty: z.string().min(2).max(100),
  study_program: z.string().min(2).max(100),
  batch: z.number().int().optional().nullable(),
  photo: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "ALUMNI"]),
  joined_at: z.string().datetime().optional().nullable(),
  graduated_at: z.string().datetime().optional().nullable(),
  linkedin_url: z.string().url().optional().nullable(),
  github_url: z.string().url().optional().nullable(),
  instagram_url: z.string().url().optional().nullable(),
  public_profile: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().optional().nullable(),
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
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
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
  portfolio_url: z.string().url().optional().nullable(),
  photo: z.string().url().optional().nullable(),
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED"]).default("SUBMITTED"),
  admin_notes: z.string().optional().nullable(),
  submitted_at: z.string().datetime(),
  accepted_at: z.string().datetime().optional().nullable(),
  rejected_at: z.string().datetime().optional().nullable(),
  converted_member_id: z.string().uuid().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Member = z.infer<typeof memberSchema>;
export type MembershipHistory = z.infer<typeof membershipHistorySchema>;
export type Registration = z.infer<typeof registrationSchema>;
