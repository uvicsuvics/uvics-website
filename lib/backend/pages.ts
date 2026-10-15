import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Constants, type Database } from "@/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { pageSchema } from "./cms";
import { AppError, databaseError } from "./errors";
import { datetimeSchema, paginationMeta, paginationSchema, slugSchema } from "./validation";

export { pageSchema };
export type PageInput = z.infer<typeof pageSchema>;

const createPageSchema = z
  .object({
    title: z.string().trim().min(1).max(255),
    slug: slugSchema,
    content: z.string().default(""),
    meta_title: z.string().max(255).nullable().optional(),
    meta_description: z.string().max(500).nullable().optional(),
  })
  .strict();

const updatePageSchema = z
  .object({
    title: z.string().trim().min(1).max(255),
    slug: slugSchema,
    content: z.string(),
    meta_title: z.string().max(255).nullable(),
    meta_description: z.string().max(500).nullable(),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, "No fields to update");

export const adminPageDto = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  status: z.enum(Constants.public.Enums.content_status),
  published_at: datetimeSchema.nullable(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
});

export type AdminPageDto = z.output<typeof adminPageDto>;

export const publicPageDto = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  published_at: datetimeSchema.nullable(),
});

export type PublicPageDto = z.output<typeof publicPageDto>;

const PUBLIC_PAGE_FIELDS = "id, title, slug, content, meta_title, meta_description, published_at";

export async function getPublicPages(client: SupabaseClient<Database>): Promise<PublicPageDto[]> {
  const { items } = await listPublicPages(client, { page: 1, page_size: 100 });
  return items;
}

export async function listPublicPages(
  client: SupabaseClient<Database>,
  raw: unknown,
): Promise<{ items: PublicPageDto[]; pagination: ReturnType<typeof paginationMeta> }> {
  const parsed = paginationSchema.safeParse(raw);
  if (!parsed.success) throw new AppError("VALIDATION_ERROR");
  const { page, page_size } = parsed.data;

  const { data, error, count } = await client
    .from("pages")
    .select(PUBLIC_PAGE_FIELDS, { count: "exact" })
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * page_size, page * page_size - 1);

  if (error) databaseError(error);

  const items = (data ?? []).map((row) => {
    const p = publicPageDto.safeParse(row);
    if (!p.success) throw new AppError("SERVICE_UNAVAILABLE");
    return p.data;
  });

  return { items, pagination: paginationMeta(page, page_size, count ?? 0) };
}

export async function getPublicPageBySlug(
  client: SupabaseClient<Database>,
  slug: string,
): Promise<PublicPageDto> {
  if (!slugSchema.safeParse(slug).success) throw new AppError("NOT_FOUND");

  const { data, error } = await client
    .from("pages")
    .select(PUBLIC_PAGE_FIELDS)
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (error) databaseError(error);
  if (!data) throw new AppError("NOT_FOUND");

  const parsed = publicPageDto.safeParse(data);
  if (!parsed.success) throw new AppError("SERVICE_UNAVAILABLE");
  return parsed.data;
}

export async function listAdminPages(client: SupabaseClient<Database>): Promise<AdminPageDto[]> {
  await requireAdmin(client);

  const { data, error } = await client
    .from("pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) databaseError(error);

  return (data ?? []).map((row) => {
    const parsed = adminPageDto.safeParse(row);
    if (!parsed.success) throw new AppError("SERVICE_UNAVAILABLE");
    return parsed.data;
  });
}

export async function getAdminPage(
  client: SupabaseClient<Database>,
  id: string,
): Promise<AdminPageDto> {
  await requireAdmin(client);
  if (!z.uuid().safeParse(id).success) throw new AppError("NOT_FOUND");

  const { data, error } = await client
    .from("pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) databaseError(error);
  if (!data) throw new AppError("NOT_FOUND");

  const parsed = adminPageDto.safeParse(data);
  if (!parsed.success) throw new AppError("SERVICE_UNAVAILABLE");
  return parsed.data;
}

export const getAdminPageById = getAdminPage;

export async function createPage(
  client: SupabaseClient<Database>,
  input: unknown,
): Promise<AdminPageDto> {
  await requireAdmin(client);

  const parsed = createPageSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", { fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const { data, error } = await client.rpc("create_page", { p_values: parsed.data });
  if (error) databaseError(error);

  const result = adminPageDto.safeParse(data);
  if (!result.success) throw new AppError("SERVICE_UNAVAILABLE");
  return result.data;
}

export async function updatePage(
  client: SupabaseClient<Database>,
  id: string,
  input: unknown,
): Promise<AdminPageDto> {
  await requireAdmin(client);
  if (!z.uuid().safeParse(id).success) throw new AppError("NOT_FOUND");

  const parsed = updatePageSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", { fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const { data, error } = await client.rpc("update_page", {
    p_id: id,
    p_changes: parsed.data,
  });
  if (error) databaseError(error);

  const result = adminPageDto.safeParse(data);
  if (!result.success) throw new AppError("SERVICE_UNAVAILABLE");
  return result.data;
}

export async function publishPage(
  client: SupabaseClient<Database>,
  id: string,
): Promise<AdminPageDto> {
  await requireAdmin(client);
  if (!z.uuid().safeParse(id).success) throw new AppError("NOT_FOUND");

  const { error } = await client.rpc("publish_page", { p_id: id });
  if (error) databaseError(error);

  return getAdminPage(client, id);
}

export async function archivePage(
  client: SupabaseClient<Database>,
  id: string,
): Promise<AdminPageDto> {
  await requireAdmin(client);
  if (!z.uuid().safeParse(id).success) throw new AppError("NOT_FOUND");

  const { data, error } = await client.rpc("archive_page", { p_id: id });
  if (error) databaseError(error);

  const result = adminPageDto.safeParse(data);
  if (!result.success) throw new AppError("SERVICE_UNAVAILABLE");
  return result.data;
}
