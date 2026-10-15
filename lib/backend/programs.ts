import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Constants, type Database } from "@/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { programSchema } from "./cms";
import { AppError, databaseError } from "./errors";
import { datetimeSchema, paginationMeta, paginationSchema, slugSchema } from "./validation";

export { programSchema };
export type ProgramInput = z.infer<typeof programSchema>;

const createProgramSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    slug: slugSchema,
    short_description: z.string().max(500).nullable().optional(),
    description: z.string().default(""),
    image: z.string().nullable().optional(),
    display_order: z.number().int().default(0),
  })
  .strict();

const updateProgramSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    slug: slugSchema,
    short_description: z.string().max(500).nullable(),
    description: z.string(),
    image: z.string().nullable(),
    display_order: z.number().int(),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, "No fields to update");

export const adminProgramDto = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  short_description: z.string().nullable(),
  description: z.string(),
  image: z.string().nullable(),
  status: z.enum(Constants.public.Enums.content_status),
  display_order: z.number().int(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
});

export type AdminProgramDto = z.output<typeof adminProgramDto>;

export const publicProgramDto = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  short_description: z.string().nullable(),
  description: z.string(),
  image: z.string().nullable(),
  display_order: z.number().int(),
});

export type PublicProgramDto = z.output<typeof publicProgramDto>;

const PUBLIC_PROGRAM_FIELDS = "id, name, slug, short_description, description, image, display_order";

export async function getPublicPrograms(client: SupabaseClient<Database>): Promise<PublicProgramDto[]> {
  const { items } = await listPublicPrograms(client, { page: 1, page_size: 100 });
  return items;
}

export async function listPublicPrograms(
  client: SupabaseClient<Database>,
  raw: unknown,
): Promise<{ items: PublicProgramDto[]; pagination: ReturnType<typeof paginationMeta> }> {
  const parsed = paginationSchema.safeParse(raw);
  if (!parsed.success) throw new AppError("VALIDATION_ERROR");
  const { page, page_size } = parsed.data;

  const { data, error, count } = await client
    .from("programs")
    .select(PUBLIC_PROGRAM_FIELDS, { count: "exact" })
    .eq("status", "PUBLISHED")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range((page - 1) * page_size, page * page_size - 1);

  if (error) databaseError(error);

  const items = (data ?? []).map((row) => {
    const p = publicProgramDto.safeParse(row);
    if (!p.success) throw new AppError("SERVICE_UNAVAILABLE");
    return p.data;
  });

  return { items, pagination: paginationMeta(page, page_size, count ?? 0) };
}

export async function getPublicProgramBySlug(
  client: SupabaseClient<Database>,
  slug: string,
): Promise<PublicProgramDto> {
  if (!slugSchema.safeParse(slug).success) throw new AppError("NOT_FOUND");

  const { data, error } = await client
    .from("programs")
    .select(PUBLIC_PROGRAM_FIELDS)
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (error) databaseError(error);
  if (!data) throw new AppError("NOT_FOUND");

  const parsed = publicProgramDto.safeParse(data);
  if (!parsed.success) throw new AppError("SERVICE_UNAVAILABLE");
  return parsed.data;
}

export async function listAdminPrograms(client: SupabaseClient<Database>): Promise<AdminProgramDto[]> {
  await requireAdmin(client);

  const { data, error } = await client
    .from("programs")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) databaseError(error);

  return (data ?? []).map((row) => {
    const parsed = adminProgramDto.safeParse(row);
    if (!parsed.success) throw new AppError("SERVICE_UNAVAILABLE");
    return parsed.data;
  });
}

export async function getAdminProgram(
  client: SupabaseClient<Database>,
  id: string,
): Promise<AdminProgramDto> {
  await requireAdmin(client);
  if (!z.uuid().safeParse(id).success) throw new AppError("NOT_FOUND");

  const { data, error } = await client
    .from("programs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) databaseError(error);
  if (!data) throw new AppError("NOT_FOUND");

  const parsed = adminProgramDto.safeParse(data);
  if (!parsed.success) throw new AppError("SERVICE_UNAVAILABLE");
  return parsed.data;
}

export const getAdminProgramById = getAdminProgram;

export async function createProgram(
  client: SupabaseClient<Database>,
  input: unknown,
): Promise<AdminProgramDto> {
  await requireAdmin(client);

  const parsed = createProgramSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", { fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const { data, error } = await client.rpc("create_program", { p_values: parsed.data });
  if (error) databaseError(error);

  const result = adminProgramDto.safeParse(data);
  if (!result.success) throw new AppError("SERVICE_UNAVAILABLE");
  return result.data;
}

export async function updateProgram(
  client: SupabaseClient<Database>,
  id: string,
  input: unknown,
): Promise<AdminProgramDto> {
  await requireAdmin(client);
  if (!z.uuid().safeParse(id).success) throw new AppError("NOT_FOUND");

  const parsed = updateProgramSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", { fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const { data, error } = await client.rpc("update_program", {
    p_id: id,
    p_changes: parsed.data,
  });
  if (error) databaseError(error);

  const result = adminProgramDto.safeParse(data);
  if (!result.success) throw new AppError("SERVICE_UNAVAILABLE");
  return result.data;
}

export async function publishProgram(
  client: SupabaseClient<Database>,
  id: string,
): Promise<AdminProgramDto> {
  await requireAdmin(client);
  if (!z.uuid().safeParse(id).success) throw new AppError("NOT_FOUND");

  const { error } = await client.rpc("publish_program", { p_id: id });
  if (error) databaseError(error);

  return getAdminProgram(client, id);
}

export async function archiveProgram(
  client: SupabaseClient<Database>,
  id: string,
): Promise<AdminProgramDto> {
  await requireAdmin(client);
  if (!z.uuid().safeParse(id).success) throw new AppError("NOT_FOUND");

  const { data, error } = await client.rpc("archive_program", { p_id: id });
  if (error) databaseError(error);

  const result = adminProgramDto.safeParse(data);
  if (!result.success) throw new AppError("SERVICE_UNAVAILABLE");
  return result.data;
}
