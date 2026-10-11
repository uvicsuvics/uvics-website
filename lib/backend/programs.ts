import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { AppError, databaseError } from "./errors";
import { slugSchema } from "./validation";

export const programSchema = z.object({
  name: z.string().min(1).max(255),
  slug: slugSchema,
  short_description: z.string().max(500).nullable().optional(),
  description: z.string(),
  image: z.string().url().nullable().optional(),
  display_order: z.number().int().default(0),
});

export type ProgramInput = z.infer<typeof programSchema>;

export const adminProgramDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  short_description: z.string().nullable(),
  description: z.string(),
  image: z.string().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  display_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AdminProgramDto = z.infer<typeof adminProgramDto>;

export const publicProgramDto = adminProgramDto.pick({
  id: true,
  name: true,
  slug: true,
  short_description: true,
  description: true,
  image: true,
  display_order: true,
});

export type PublicProgramDto = z.infer<typeof publicProgramDto>;

export async function getPublicPrograms(client: SupabaseClient<Database>): Promise<PublicProgramDto[]> {
  const { data, error } = await client
    .from("programs")
    .select("id, name, slug, short_description, description, image, display_order")
    .eq("status", "PUBLISHED")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) databaseError(error);
  return data as PublicProgramDto[];
}

export async function getPublicProgramBySlug(client: SupabaseClient<Database>, slug: string): Promise<PublicProgramDto> {
  const { data, error } = await client
    .from("programs")
    .select("id, name, slug, short_description, description, image, display_order")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();

  if (error) databaseError(error);
  if (!data) throw new AppError("NOT_FOUND");
  return data as PublicProgramDto;
}

export async function listAdminPrograms(client: SupabaseClient<Database>): Promise<AdminProgramDto[]> {
  const { data, error } = await client
    .from("programs")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) databaseError(error);
  return data as AdminProgramDto[];
}

export async function getAdminProgramById(client: SupabaseClient<Database>, id: string): Promise<AdminProgramDto> {
  const { data, error } = await client
    .from("programs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) databaseError(error);
  if (!data) throw new AppError("NOT_FOUND");
  return data as AdminProgramDto;
}

export async function createProgram(client: SupabaseClient<Database>, input: unknown): Promise<AdminProgramDto> {
  const parsed = programSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", { fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const { data, error } = await client.from("programs").insert(parsed.data).select().single();
  if (error) databaseError(error);

  const { error: auditError } = await client.rpc("log_cms_audit", {
    p_action: "PROGRAM_CREATED",
    p_entity_type: "program",
    p_entity_id: data.id,
    p_old: {},
    p_new: { name: data.name, slug: data.slug }
  });
  if (auditError) console.error("Failed to audit PROGRAM_CREATED", auditError);

  return data as AdminProgramDto;
}

export async function updateProgram(client: SupabaseClient<Database>, id: string, input: unknown): Promise<AdminProgramDto> {
  const parsed = programSchema.partial().safeParse(input);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", { fieldErrors: parsed.error.flatten().fieldErrors });
  }

  const { data: old, error: errOld } = await client.from("programs").select("name, slug").eq("id", id).single();
  if (errOld) databaseError(errOld);

  const { data, error } = await client.from("programs").update(parsed.data).eq("id", id).select().single();
  if (error) databaseError(error);

  const { error: auditError } = await client.rpc("log_cms_audit", {
    p_action: "PROGRAM_UPDATED",
    p_entity_type: "program",
    p_entity_id: data.id,
    p_old: old || {},
    p_new: { name: data.name, slug: data.slug }
  });
  if (auditError) console.error("Failed to audit PROGRAM_UPDATED", auditError);

  return data as AdminProgramDto;
}

export async function publishProgram(client: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await client.rpc("publish_program", { p_id: id });
  if (error) databaseError(error);

  const { error: auditError } = await client.rpc("log_cms_audit", {
    p_action: "PROGRAM_PUBLISHED",
    p_entity_type: "program",
    p_entity_id: id,
    p_old: {},
    p_new: { status: "PUBLISHED" }
  });
  if (auditError) console.error("Failed to audit PROGRAM_PUBLISHED", auditError);
}

export async function archiveProgram(client: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await client.from("programs").update({ status: "ARCHIVED" }).eq("id", id);
  if (error) databaseError(error);

  const { error: auditError } = await client.rpc("log_cms_audit", {
    p_action: "PROGRAM_ARCHIVED",
    p_entity_type: "program",
    p_entity_id: id,
    p_old: {},
    p_new: { status: "ARCHIVED" }
  });
  if (auditError) console.error("Failed to audit PROGRAM_ARCHIVED", auditError);
}
