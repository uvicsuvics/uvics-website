import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { AppError, databaseError } from "./errors";
import { slugSchema } from "./validation";

export const pageSchema = z.object({
  title: z.string().min(1).max(255),
  slug: slugSchema,
  content: z.string(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
});

export type PageInput = z.infer<typeof pageSchema>;

export const adminPageDto = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AdminPageDto = z.infer<typeof adminPageDto>;

export const publicPageDto = adminPageDto.pick({
  id: true,
  title: true,
  slug: true,
  content: true,
  meta_title: true,
  meta_description: true,
  published_at: true,
});

export type PublicPageDto = z.infer<typeof publicPageDto>;

export async function getPublicPages(client: SupabaseClient<Database>): Promise<PublicPageDto[]> {
  const { data, error } = await client
    .from("pages")
    .select("id, title, slug, content, meta_title, meta_description, published_at")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  if (error) databaseError(error);
  return data as PublicPageDto[];
}

export async function getPublicPageBySlug(client: SupabaseClient<Database>, slug: string): Promise<PublicPageDto> {
  const { data, error } = await client
    .from("pages")
    .select("id, title, slug, content, meta_title, meta_description, published_at")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();

  if (error) databaseError(error);
  if (!data) throw new AppError("NOT_FOUND");
  return data as PublicPageDto;
}

export async function listAdminPages(client: SupabaseClient<Database>): Promise<AdminPageDto[]> {
  const { data, error } = await client
    .from("pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) databaseError(error);
  return data as AdminPageDto[];
}

export async function getAdminPageById(client: SupabaseClient<Database>, id: string): Promise<AdminPageDto> {
  const { data, error } = await client
    .from("pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) databaseError(error);
  if (!data) throw new AppError("NOT_FOUND");
  return data as AdminPageDto;
}

export async function createPage(client: SupabaseClient<Database>, input: unknown): Promise<AdminPageDto> {
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", { fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const { data, error } = await client.from("pages").insert(parsed.data).select().single();
  if (error) databaseError(error);

  const { error: auditError } = await client.rpc("log_cms_audit", {
    p_action: "PAGE_CREATED",
    p_entity_type: "page",
    p_entity_id: data.id,
    p_old: {},
    p_new: { title: data.title, slug: data.slug }
  });
  if (auditError) console.error("Failed to audit PAGE_CREATED", auditError);

  return data as AdminPageDto;
}

export async function updatePage(client: SupabaseClient<Database>, id: string, input: unknown): Promise<AdminPageDto> {
  const parsed = pageSchema.partial().safeParse(input);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", { fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const { data: old, error: errOld } = await client.from("pages").select("title, slug").eq("id", id).single();
  if (errOld) databaseError(errOld);

  const { data, error } = await client.from("pages").update(parsed.data).eq("id", id).select().single();
  if (error) databaseError(error);

  const { error: auditError } = await client.rpc("log_cms_audit", {
    p_action: "PAGE_UPDATED",
    p_entity_type: "page",
    p_entity_id: data.id,
    p_old: old || {},
    p_new: { title: data.title, slug: data.slug }
  });
  if (auditError) console.error("Failed to audit PAGE_UPDATED", auditError);

  return data as AdminPageDto;
}

export async function publishPage(client: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await client.rpc("publish_page", { p_id: id });
  if (error) databaseError(error);

  const { error: auditError } = await client.rpc("log_cms_audit", {
    p_action: "PAGE_PUBLISHED",
    p_entity_type: "page",
    p_entity_id: id,
    p_old: {},
    p_new: { status: "PUBLISHED" }
  });
  if (auditError) console.error("Failed to audit PAGE_PUBLISHED", auditError);
}

export async function archivePage(client: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await client.from("pages").update({ status: "ARCHIVED" }).eq("id", id);
  if (error) databaseError(error);

  const { error: auditError } = await client.rpc("log_cms_audit", {
    p_action: "PAGE_ARCHIVED",
    p_entity_type: "page",
    p_entity_id: id,
    p_old: {},
    p_new: { status: "ARCHIVED" }
  });
  if (auditError) console.error("Failed to audit PAGE_ARCHIVED", auditError);
}
