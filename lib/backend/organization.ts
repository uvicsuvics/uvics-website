import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import type { Database } from "@/types/database";
import {
  AppError,
  databaseError,
  toFailure,
  type OperationResult,
} from "./errors";
import { calendarDateSchema, datetimeSchema, slugSchema } from "./validation";

type Client = SupabaseClient<Database>;

// PostgREST mengembalikan timestamptz dengan offset (+00:00) dan mikrodetik.
const timestampSchema = z.iso.datetime({ offset: true });
const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;
const displayOrderSchema = z.number().int().min(INT32_MIN).max(INT32_MAX);
const optionalDescriptionSchema = z
  .string()
  .trim()
  .max(2000)
  .transform((v) => v || null)
  .nullable();

const END_DATE_ORDER_MESSAGE =
  "end_date harus setelah atau sama dengan start_date.";
const NON_CORE_DEPARTMENT_MESSAGE =
  "Posisi selain pengurus inti dan advisor wajib memiliki departemen.";
const DUPLICATE_SLUG_MESSAGE = "Slug sudah dipakai.";

// ============================================================
// Domain Row Schemas
// ============================================================

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

// ============================================================
// Normalized Admin Output DTO Schemas (UTC `Z` timestamps)
// ============================================================

const adminOrganizationPeriodDto = z
  .object({
    id: z.uuid(),
    name: z.string().min(1).max(120),
    start_date: calendarDateSchema,
    end_date: calendarDateSchema,
    status: z.enum(["UPCOMING", "ACTIVE", "ENDED"]),
    created_at: datetimeSchema,
    updated_at: datetimeSchema,
  })
  .refine((data) => data.start_date <= data.end_date);

const adminDepartmentDto = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(120),
  slug: slugSchema.max(120),
  description: z.string().nullable(),
  display_order: z.number().int(),
  active: z.boolean(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
});

const adminPositionDto = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(120),
  description: z.string().nullable(),
  level: positionLevelSchema,
  display_order: z.number().int(),
  active: z.boolean(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
});

const adminMembershipHistoryDto = z
  .object({
    id: z.uuid(),
    member_id: z.uuid(),
    organization_period_id: z.uuid(),
    department_id: z.uuid().nullable(),
    position_id: z.uuid(),
    start_date: calendarDateSchema.nullable(),
    end_date: calendarDateSchema.nullable(),
    notes: z.string().nullable(),
    created_at: datetimeSchema,
    updated_at: datetimeSchema,
  })
  .refine(
    (data) => !data.start_date || !data.end_date || data.end_date >= data.start_date,
  );

const deleteOrganizationEntityDto = z.object({
  id: z.uuid(),
  deleted: z.literal(true),
});

// ============================================================
// Admin Mutation Input Schemas (strict allowlist)
// ============================================================

export const createOrganizationPeriodInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    start_date: calendarDateSchema,
    end_date: calendarDateSchema,
  })
  .strict()
  .refine((data) => data.start_date <= data.end_date, {
    message: END_DATE_ORDER_MESSAGE,
    path: ["end_date"],
  });

export const updateOrganizationPeriodInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    start_date: calendarDateSchema,
    end_date: calendarDateSchema,
  })
  .partial()
  .strict()
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Minimal satu field harus diisi untuk pembaruan.",
  })
  .refine(
    (data) => !data.start_date || !data.end_date || data.start_date <= data.end_date,
    {
      message: END_DATE_ORDER_MESSAGE,
      path: ["end_date"],
    },
  );

export const createDepartmentInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    slug: slugSchema.max(120),
    description: optionalDescriptionSchema.optional(),
    display_order: displayOrderSchema.default(0),
    active: z.boolean().default(true),
  })
  .strict();

export const updateDepartmentInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    slug: slugSchema.max(120),
    description: optionalDescriptionSchema,
    display_order: displayOrderSchema,
    active: z.boolean(),
  })
  .partial()
  .strict()
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Minimal satu field harus diisi untuk pembaruan.",
  });

export const createPositionInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: optionalDescriptionSchema.optional(),
    level: positionLevelSchema,
    display_order: displayOrderSchema.default(0),
    active: z.boolean().default(true),
  })
  .strict();

export const updatePositionInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: optionalDescriptionSchema,
    level: positionLevelSchema,
    display_order: displayOrderSchema,
    active: z.boolean(),
  })
  .partial()
  .strict()
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Minimal satu field harus diisi untuk pembaruan.",
  });

export const assignMembershipHistoryInputSchema = z
  .object({
    member_id: z.uuid(),
    organization_period_id: z.uuid(),
    /** Nullable: hanya untuk posisi level CORE atau ADVISOR (D24). */
    department_id: z.uuid().nullable().optional(),
    position_id: z.uuid(),
    start_date: calendarDateSchema,
    end_date: calendarDateSchema.nullable().optional(),
    notes: optionalDescriptionSchema.optional(),
  })
  .strict()
  .refine((data) => !data.end_date || data.end_date >= data.start_date, {
    message: END_DATE_ORDER_MESSAGE,
    path: ["end_date"],
  });

export const endMembershipHistoryInputSchema = z
  .object({
    end_date: calendarDateSchema,
    /** Omitted mempertahankan catatan lama; null atau "" menghapus catatan. */
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();

// ============================================================
// Exported Types
// ============================================================

export type Department = z.infer<typeof departmentSchema>;
export type PositionLevel = z.infer<typeof positionLevelSchema>;
export type Position = z.infer<typeof positionSchema>;
export type OrganizationPeriod = z.infer<typeof organizationPeriodSchema>;
export type AdminDepartmentDto = z.output<typeof adminDepartmentDto>;
export type AdminPositionDto = z.output<typeof adminPositionDto>;
export type AdminOrganizationPeriodDto = z.output<typeof adminOrganizationPeriodDto>;
export type AdminMembershipHistoryDto = z.output<typeof adminMembershipHistoryDto>;
export type DeleteOrganizationEntityResult = z.output<
  typeof deleteOrganizationEntityDto
>;
export type CreateOrganizationPeriodInput = z.input<
  typeof createOrganizationPeriodInputSchema
>;
export type UpdateOrganizationPeriodInput = z.input<
  typeof updateOrganizationPeriodInputSchema
>;
export type CreateDepartmentInput = z.input<typeof createDepartmentInputSchema>;
export type UpdateDepartmentInput = z.input<typeof updateDepartmentInputSchema>;
export type CreatePositionInput = z.input<typeof createPositionInputSchema>;
export type UpdatePositionInput = z.input<typeof updatePositionInputSchema>;
export type AssignMembershipHistoryInput = z.input<
  typeof assignMembershipHistoryInputSchema
>;
export type EndMembershipHistoryInput = z.input<
  typeof endMembershipHistoryInputSchema
>;

// ============================================================
// Internal Helpers
// ============================================================

function assertUuid(id: string): string {
  if (!z.uuid().safeParse(id).success) {
    throw new AppError("NOT_FOUND");
  }
  return id;
}

function toFieldErrors(
  raw: Record<string, string[] | undefined>,
): Record<string, string[]> | undefined {
  const entries = Object.entries(raw).filter(
    (entry): entry is [string, string[]] =>
      Array.isArray(entry[1]) && entry[1].length > 0,
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function stripUndefined<T extends Record<string, unknown>>(
  obj: T,
): Record<string, Exclude<T[keyof T], undefined>> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Record<string, Exclude<T[keyof T], undefined>>;
}

function parseInput<T extends z.ZodType>(schema: T, raw: unknown): z.output<T> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = toFieldErrors(z.flattenError(parsed.error).fieldErrors);
    throw new AppError(
      "VALIDATION_ERROR",
      fieldErrors ? { fieldErrors } : undefined,
    );
  }
  return parsed.data;
}

function parseOutput<T extends z.ZodType>(schema: T, raw: unknown): z.output<T> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("SERVICE_UNAVAILABLE");
  }
  return parsed.data;
}

function handleRpcError(
  error: { code?: string; message?: string },
  options: { slugUnique?: boolean } = {},
): never {
  if (options.slugUnique && error.code === "23505") {
    throw new AppError("CONFLICT", {
      fieldErrors: { slug: [DUPLICATE_SLUG_MESSAGE] },
    });
  }
  if (error.code === "23514") {
    if (error.message?.includes("wajib memiliki departemen")) {
      throw new AppError("VALIDATION_ERROR", {
        fieldErrors: { department_id: [NON_CORE_DEPARTMENT_MESSAGE] },
      });
    }
    if (error.message?.includes("end_date harus setelah atau sama dengan start_date")) {
      throw new AppError("VALIDATION_ERROR", {
        fieldErrors: { end_date: [END_DATE_ORDER_MESSAGE] },
      });
    }
  }
  databaseError(error);
}

async function runAdminMutation<T>(
  client: Client,
  fn: () => Promise<T>,
): Promise<OperationResult<T>> {
  try {
    await requireAdmin(client);
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    return toFailure(error);
  }
}

// ============================================================
// Organization Period Admin Mutations (#75)
// ============================================================

/** Membuat periode organisasi baru berstatus UPCOMING lewat RPC ter-audit (D13). */
export function createOrganizationPeriod(
  client: Client,
  input: unknown,
): Promise<OperationResult<AdminOrganizationPeriodDto>> {
  return runAdminMutation(client, async () => {
    const parsed = parseInput(createOrganizationPeriodInputSchema, input);
    const { data, error } = await client.rpc("admin_create_organization_period", {
      p_values: parsed,
    });
    if (error) handleRpcError(error);
    return parseOutput(adminOrganizationPeriodDto, data);
  });
}

/** Memperbarui nama atau rentang tanggal periode organisasi lewat RPC ter-audit (D13). */
export function updateOrganizationPeriod(
  client: Client,
  id: string,
  input: unknown,
): Promise<OperationResult<AdminOrganizationPeriodDto>> {
  return runAdminMutation(client, async () => {
    assertUuid(id);
    const parsed = stripUndefined(
      parseInput(updateOrganizationPeriodInputSchema, input),
    );
    const { data, error } = await client.rpc("admin_update_organization_period", {
      p_id: id,
      p_changes: parsed,
    });
    if (error) handleRpcError(error);
    return parseOutput(adminOrganizationPeriodDto, data);
  });
}

/** Mengaktifkan periode organisasi UPCOMING; menolak jika sudah ada periode ACTIVE (D07, D13). */
export function activateOrganizationPeriod(
  client: Client,
  id: string,
): Promise<OperationResult<AdminOrganizationPeriodDto>> {
  return runAdminMutation(client, async () => {
    assertUuid(id);
    const { data, error } = await client.rpc("admin_activate_organization_period", {
      p_id: id,
    });
    if (error) handleRpcError(error);
    return parseOutput(adminOrganizationPeriodDto, data);
  });
}

/** Mengakhiri periode organisasi ACTIVE menjadi ENDED tanpa menghapus histori (D13, D14). */
export function endOrganizationPeriod(
  client: Client,
  id: string,
): Promise<OperationResult<AdminOrganizationPeriodDto>> {
  return runAdminMutation(client, async () => {
    assertUuid(id);
    const { data, error } = await client.rpc("admin_end_organization_period", {
      p_id: id,
    });
    if (error) handleRpcError(error);
    return parseOutput(adminOrganizationPeriodDto, data);
  });
}

/** Menghapus periode organisasi yang tidak aktif dan tidak direferensikan histori (D14). */
export function deleteOrganizationPeriod(
  client: Client,
  id: string,
): Promise<OperationResult<DeleteOrganizationEntityResult>> {
  return runAdminMutation(client, async () => {
    assertUuid(id);
    const { data, error } = await client.rpc("admin_delete_organization_period", {
      p_id: id,
    });
    if (error) handleRpcError(error);
    return parseOutput(deleteOrganizationEntityDto, data);
  });
}

// ============================================================
// Department Admin Mutations (#75)
// ============================================================

/** Membuat departemen baru lewat RPC ter-audit (D13). */
export function createDepartment(
  client: Client,
  input: unknown,
): Promise<OperationResult<AdminDepartmentDto>> {
  return runAdminMutation(client, async () => {
    const parsed = stripUndefined(
      parseInput(createDepartmentInputSchema, input),
    );
    const { data, error } = await client.rpc("admin_create_department", {
      p_values: parsed,
    });
    if (error) handleRpcError(error, { slugUnique: true });
    return parseOutput(adminDepartmentDto, data);
  });
}

/** Memperbarui departemen (nama, slug, deskripsi, display_order, status aktif) lewat RPC ter-audit (D13). */
export function updateDepartment(
  client: Client,
  id: string,
  input: unknown,
): Promise<OperationResult<AdminDepartmentDto>> {
  return runAdminMutation(client, async () => {
    assertUuid(id);
    const parsed = stripUndefined(
      parseInput(updateDepartmentInputSchema, input),
    );
    const { data, error } = await client.rpc("admin_update_department", {
      p_id: id,
      p_changes: parsed,
    });
    if (error) handleRpcError(error, { slugUnique: true });
    return parseOutput(adminDepartmentDto, data);
  });
}

/** Mengaktifkan atau menonaktifkan departemen lewat RPC ter-audit (D13, D14). */
export function setDepartmentActive(
  client: Client,
  id: string,
  active: boolean,
): Promise<OperationResult<AdminDepartmentDto>> {
  return updateDepartment(client, id, { active });
}

/** Menghapus departemen yang tidak direferensikan histori atau pendaftaran (D14). */
export function deleteDepartment(
  client: Client,
  id: string,
): Promise<OperationResult<DeleteOrganizationEntityResult>> {
  return runAdminMutation(client, async () => {
    assertUuid(id);
    const { data, error } = await client.rpc("admin_delete_department", {
      p_id: id,
    });
    if (error) handleRpcError(error);
    return parseOutput(deleteOrganizationEntityDto, data);
  });
}

// ============================================================
// Position Admin Mutations (#75)
// ============================================================

/** Membuat posisi baru dengan level kanonis D29 lewat RPC ter-audit (D13). */
export function createPosition(
  client: Client,
  input: unknown,
): Promise<OperationResult<AdminPositionDto>> {
  return runAdminMutation(client, async () => {
    const parsed = stripUndefined(parseInput(createPositionInputSchema, input));
    const { data, error } = await client.rpc("admin_create_position", {
      p_values: parsed,
    });
    if (error) handleRpcError(error);
    return parseOutput(adminPositionDto, data);
  });
}

/** Memperbarui posisi (nama, deskripsi, level D29, display_order, status aktif) lewat RPC ter-audit (D13). */
export function updatePosition(
  client: Client,
  id: string,
  input: unknown,
): Promise<OperationResult<AdminPositionDto>> {
  return runAdminMutation(client, async () => {
    assertUuid(id);
    const parsed = stripUndefined(parseInput(updatePositionInputSchema, input));
    const { data, error } = await client.rpc("admin_update_position", {
      p_id: id,
      p_changes: parsed,
    });
    if (error) handleRpcError(error);
    return parseOutput(adminPositionDto, data);
  });
}

/** Mengaktifkan atau menonaktifkan posisi lewat RPC ter-audit (D13, D14). */
export function setPositionActive(
  client: Client,
  id: string,
  active: boolean,
): Promise<OperationResult<AdminPositionDto>> {
  return updatePosition(client, id, { active });
}

/** Menghapus posisi yang tidak direferensikan histori keanggotaan (D14). */
export function deletePosition(
  client: Client,
  id: string,
): Promise<OperationResult<DeleteOrganizationEntityResult>> {
  return runAdminMutation(client, async () => {
    assertUuid(id);
    const { data, error } = await client.rpc("admin_delete_position", {
      p_id: id,
    });
    if (error) handleRpcError(error);
    return parseOutput(deleteOrganizationEntityDto, data);
  });
}

// ============================================================
// Membership History Admin Mutations (#75)
// ============================================================

/** Menempatkan member aktif pada periode, departemen (wajib untuk non-inti D24), dan posisi lewat RPC ter-audit (D13). */
export function assignMembershipHistory(
  client: Client,
  input: unknown,
): Promise<OperationResult<AdminMembershipHistoryDto>> {
  return runAdminMutation(client, async () => {
    const parsed = stripUndefined(
      parseInput(assignMembershipHistoryInputSchema, input),
    );
    const { data, error } = await client.rpc("admin_assign_membership_history", {
      p_values: parsed,
    });
    if (error) handleRpcError(error);
    return parseOutput(adminMembershipHistoryDto, data);
  });
}

/** Mengakhiri penempatan member dengan mengisi end_date (dan catatan opsional) lewat RPC ter-audit (D13, D14). */
export function endMembershipHistory(
  client: Client,
  id: string,
  input: unknown,
): Promise<OperationResult<AdminMembershipHistoryDto>> {
  return runAdminMutation(client, async () => {
    assertUuid(id);
    const parsed = parseInput(endMembershipHistoryInputSchema, input);
    const rpcArgs: { p_id: string; p_end_date: string; p_notes?: string } = {
      p_id: id,
      p_end_date: parsed.end_date,
    };
    if (parsed.notes !== undefined) {
      rpcArgs.p_notes = parsed.notes ?? "";
    }
    const { data, error } = await client.rpc(
      "admin_end_membership_history",
      rpcArgs,
    );
    if (error) handleRpcError(error);
    return parseOutput(adminMembershipHistoryDto, data);
  });
}
