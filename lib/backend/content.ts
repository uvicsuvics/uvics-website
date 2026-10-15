import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { Constants, type Database } from "@/types/database";
import { contentStatusSchema, httpUrlSchema } from "./cms";
import { AppError, databaseError } from "./errors";
import { calendarDateSchema, paginationMeta, paginationSchema, slugSchema } from "./validation";

type Client = SupabaseClient<Database>;

export const competitionStatusSchema = z.enum(Constants.public.Enums.competition_status);
export const projectStatusSchema = z.enum(Constants.public.Enums.project_status);
export const levelSchema = z.enum(Constants.public.Enums.content_level);
// Referensi media, bukan URL; bentuk final ditetapkan alur upload #28/#29.
const mediaSchema = z.string().trim().max(500).nullable().optional();

export const competitionSchema = z
  .object({
    title: z.string().trim().min(1).max(255),
    slug: slugSchema,
    organizer: z.string().trim().min(1).max(255),
    description: z.string().trim().max(20000).default(""),
    category: z.string().trim().max(120).nullable().optional(),
    level: levelSchema.nullable().optional(),
    registration_deadline: calendarDateSchema.nullable().optional(),
    competition_date: calendarDateSchema.nullable().optional(),
    registration_url: httpUrlSchema.nullable().optional(),
    guidebook_url: httpUrlSchema.nullable().optional(),
    poster: mediaSchema,
    team_size: z.string().trim().max(100).nullable().optional(),
    eligibility: z.string().trim().max(2000).nullable().optional(),
    status: competitionStatusSchema.default("UPCOMING"),
    publication_status: contentStatusSchema.default("DRAFT"),
    featured: z.boolean().default(false),
  })
  .refine((v) => !v.registration_deadline || !v.competition_date || v.registration_deadline <= v.competition_date, {
    message: "Batas pendaftaran harus sebelum atau sama dengan tanggal lomba.",
    path: ["registration_deadline"],
  });

export const achievementSchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: slugSchema,
  competition_name: z.string().trim().min(1).max(255),
  organizer: z.string().trim().max(255).nullable().optional(),
  level: levelSchema.nullable().optional(),
  ranking: z.string().trim().min(1).max(120),
  achievement_date: calendarDateSchema,
  description: z.string().trim().max(20000).default(""),
  cover_image: mediaSchema,
  publication_status: contentStatusSchema.default("DRAFT"),
});

// U18: sertifikat adalah media privat, disimpan terpisah dari achievement publik.
export const achievementCertificateSchema = z.object({
  achievement_id: z.string().uuid(),
  certificate_file: z.string().trim().min(1).max(500),
});

export const projectSchema = z
  .object({
    title: z.string().trim().min(1).max(255),
    slug: slugSchema,
    summary: z.string().trim().min(1).max(500),
    description: z.string().trim().max(20000).default(""),
    cover_image: mediaSchema,
    project_url: httpUrlSchema.nullable().optional(),
    repository_url: httpUrlSchema.nullable().optional(),
    start_date: calendarDateSchema.nullable().optional(),
    end_date: calendarDateSchema.nullable().optional(),
    status: projectStatusSchema.default("PLANNED"),
    publication_status: contentStatusSchema.default("DRAFT"),
    featured: z.boolean().default(false),
  })
  .refine((v) => !v.start_date || !v.end_date || v.start_date <= v.end_date, {
    message: "Tanggal mulai harus sebelum atau sama dengan tanggal selesai.",
    path: ["start_date"],
  });

// D18: anggota tertaut (member_id) atau peserta non-member (member_name).
export const contentMemberSchema = z
  .object({
    member_id: z.string().uuid().nullable().optional(),
    member_name: z.string().trim().min(1).max(255).nullable().optional(),
    role: z.string().trim().max(120).nullable().optional(),
  })
  .refine((v) => v.member_id || v.member_name, {
    message: "Pilih member atau isi nama peserta.",
    path: ["member_name"],
  });

// Nilai kosong dari form GET ("Semua") berarti tanpa filter.
const optional = <T extends z.ZodType>(schema: T) => z.preprocess((v) => (v === "" ? undefined : v), schema.optional());
// Buang karakter khusus filter PostgREST (, ( ) " ' \ :) dan pola LIKE (* % _); hasil kosong = tanpa filter.
export function normalizeSearch(term: string) {
  return term.replace(/[,()"'\\*%_:]/g, "").replace(/\s+/g, " ").trim();
}
const searchSchema = z.string().max(100).optional().transform((v) => (v ? normalizeSearch(v) : "") || undefined);
const featuredSchema = optional(z.stringbool());
const competitionFilterSchema = z.object({
  search: searchSchema,
  status: optional(competitionStatusSchema),
  category: optional(z.string().max(120)),
  level: optional(levelSchema),
  featured: featuredSchema,
});
const achievementFilterSchema = z.object({ search: searchSchema, level: optional(levelSchema) });
const projectFilterSchema = z.object({ search: searchSchema, status: optional(projectStatusSchema), featured: featuredSchema });

// Proyeksi publik eksplisit: tanpa publication_status dan member_id (D02).
const COMPETITION_FIELDS =
  "id,title,slug,organizer,description,category,level,registration_deadline,competition_date,registration_url,guidebook_url,poster,team_size,eligibility,status,featured,created_at,updated_at";
const ACHIEVEMENT_FIELDS =
  "id,title,slug,competition_name,organizer,level,ranking,achievement_date,description,cover_image,created_at,updated_at,achievement_members(member_name,role)";
const PROJECT_FIELDS =
  "id,title,slug,summary,description,cover_image,project_url,repository_url,start_date,end_date,status,featured,created_at,updated_at,project_members(member_name,role)";

function parseQuery<T extends z.ZodType>(schema: T, raw: unknown): z.infer<T> {
  const result = schema.safeParse(raw);
  if (!result.success) throw new AppError("VALIDATION_ERROR");
  return result.data;
}

async function toPage<T>(
  request: PromiseLike<{ data: T[] | null; error: { code?: string } | null; count: number | null }>,
  { page, page_size }: { page: number; page_size: number },
) {
  const { data, error, count } = await request;
  if (error) databaseError(error);
  return { items: data ?? [], pagination: paginationMeta(page, page_size, count ?? 0) };
}

async function toItem<T>(request: PromiseLike<{ data: T | null; error: { code?: string } | null }>) {
  const { data, error } = await request;
  if (error) databaseError(error);
  if (!data) throw new AppError("NOT_FOUND");
  return data;
}

// Slug tidak valid diperlakukan sama dengan slug yang tidak ada (404).
function publicSlug(slug: string) {
  if (!slugSchema.safeParse(slug).success) throw new AppError("NOT_FOUND");
  return slug;
}

const rangeOf = ({ page, page_size }: { page: number; page_size: number }) => [(page - 1) * page_size, page * page_size - 1] as const;

// Filter PUBLISHED eksplisit: sesi admin di halaman publik membuka draft lewat RLS admin.
export async function listPublicCompetitions(client: Client, raw: unknown) {
  const pagination = parseQuery(paginationSchema, raw);
  const filter = parseQuery(competitionFilterSchema, raw);
  let query = client.from("competitions").select(COMPETITION_FIELDS, { count: "exact" }).eq("publication_status", "PUBLISHED");
  if (filter.search) query = query.or(`title.ilike.%${filter.search}%,organizer.ilike.%${filter.search}%`);
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.category) query = query.eq("category", filter.category);
  if (filter.level) query = query.eq("level", filter.level);
  if (filter.featured !== undefined) query = query.eq("featured", filter.featured);
  return toPage(query.order("created_at", { ascending: false }).order("id", { ascending: false }).range(...rangeOf(pagination)), pagination);
}

export async function listPublicAchievements(client: Client, raw: unknown) {
  const pagination = parseQuery(paginationSchema, raw);
  const filter = parseQuery(achievementFilterSchema, raw);
  let query = client.from("achievements").select(ACHIEVEMENT_FIELDS, { count: "exact" }).eq("publication_status", "PUBLISHED");
  if (filter.search) query = query.or(`title.ilike.%${filter.search}%,competition_name.ilike.%${filter.search}%`);
  if (filter.level) query = query.eq("level", filter.level);
  return toPage(query.order("achievement_date", { ascending: false }).order("id", { ascending: false }).range(...rangeOf(pagination)), pagination);
}

export async function listPublicProjects(client: Client, raw: unknown) {
  const pagination = parseQuery(paginationSchema, raw);
  const filter = parseQuery(projectFilterSchema, raw);
  let query = client.from("projects").select(PROJECT_FIELDS, { count: "exact" }).eq("publication_status", "PUBLISHED");
  if (filter.search) query = query.ilike("title", `%${filter.search}%`);
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.featured !== undefined) query = query.eq("featured", filter.featured);
  return toPage(query.order("created_at", { ascending: false }).order("id", { ascending: false }).range(...rangeOf(pagination)), pagination);
}

export async function getPublicCompetitionBySlug(client: Client, slug: string) {
  const key = publicSlug(slug);
  return toItem(client.from("competitions").select(COMPETITION_FIELDS).eq("publication_status", "PUBLISHED").eq("slug", key).maybeSingle());
}

export async function getPublicAchievementBySlug(client: Client, slug: string) {
  const key = publicSlug(slug);
  return toItem(client.from("achievements").select(ACHIEVEMENT_FIELDS).eq("publication_status", "PUBLISHED").eq("slug", key).maybeSingle());
}

export async function getPublicProjectBySlug(client: Client, slug: string) {
  const key = publicSlug(slug);
  return toItem(client.from("projects").select(PROJECT_FIELDS).eq("publication_status", "PUBLISHED").eq("slug", key).maybeSingle());
}
