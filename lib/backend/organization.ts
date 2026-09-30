import { z } from "zod";

export const departmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  description: z.string().nullable().optional(),
  display_order: z.number().int().default(0),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const positionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  description: z.string().nullable().optional(),
  level: z.string().min(1).max(80),
  display_order: z.number().int().default(0),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const organizationPeriodSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(["UPCOMING", "ACTIVE", "ENDED"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});



export type Department = z.infer<typeof departmentSchema>;
export type Position = z.infer<typeof positionSchema>;
export type OrganizationPeriod = z.infer<typeof organizationPeriodSchema>;
