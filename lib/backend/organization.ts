import { z } from "zod";
import { calendarDateSchema, slugSchema } from "./validation";

// PostgREST mengembalikan timestamptz dengan offset (+00:00) dan mikrodetik.
const timestampSchema = z.iso.datetime({ offset: true });

export const departmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  slug: slugSchema.max(120),
  description: z.string().nullable().optional(),
  display_order: z.number().int().default(0),
  active: z.boolean().default(true),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const POSITION_LEVELS = [
  "ADVISOR",
  "CORE",
  "STEERING_HELPER",
  "COORDINATOR",
  "PIC",
  "MEMBER",
] as const;

export const positionLevelSchema = z.enum(POSITION_LEVELS);

export const positionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  description: z.string().nullable().optional(),
  level: positionLevelSchema,
  display_order: z.number().int().default(0),
  active: z.boolean().default(true),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const organizationPeriodSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(120),
    start_date: calendarDateSchema,
    end_date: calendarDateSchema,
    status: z.enum(["UPCOMING", "ACTIVE", "ENDED"]),
    created_at: timestampSchema,
    updated_at: timestampSchema,
  })
  .refine((data) => data.start_date <= data.end_date, {
    message: "start_date harus sebelum atau sama dengan end_date.",
    path: ["end_date"],
  });

export type Department = z.infer<typeof departmentSchema>;
export type PositionLevel = z.infer<typeof positionLevelSchema>;
export type Position = z.infer<typeof positionSchema>;
export type OrganizationPeriod = z.infer<typeof organizationPeriodSchema>;
