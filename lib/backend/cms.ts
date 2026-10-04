import { z } from "zod";
import { serviceClient } from "@/lib/supabase/service";
import { AppError } from "./errors";
import { paginationSchema, paginationMeta, slugSchema } from "./validation";

export const competitionStatusSchema = z.enum(["UPCOMING", "OPEN", "CLOSED", "ONGOING", "FINISHED"]);
export const projectStatusSchema = z.enum(["PLANNED", "ONGOING", "COMPLETED", "ARCHIVED"]);

export const competitionSchema = z.object({
  title: z.string().min(1).max(255),
  slug: slugSchema,
  organizer: z.string().min(1).max(255),
  description: z.string().default(""),
  category: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  registration_deadline: z.string().nullable().optional(),
  competition_date: z.string().nullable().optional(),
  registration_url: z.string().url().nullable().optional(),
  guidebook_url: z.string().url().nullable().optional(),
  poster_url: z.string().nullable().optional(),
  team_size: z.string().nullable().optional(),
  eligibility: z.string().nullable().optional(),
  status: competitionStatusSchema.default("UPCOMING"),
  featured: z.boolean().default(false),
}).refine((data) => {
  if (data.registration_deadline && data.competition_date) {
    return new Date(data.registration_deadline) <= new Date(data.competition_date);
  }
  return true;
}, {
  message: "Registration deadline must be before or equal to competition date",
  path: ["registration_deadline"],
});

export const achievementSchema = z.object({
  title: z.string().min(1).max(255),
  slug: slugSchema,
  competition_name: z.string().min(1).max(255),
  organizer: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  ranking: z.string().min(1),
  achievement_date: z.string().min(1),
  description: z.string().default(""),
  cover_image: z.string().nullable().optional(),
  certificate_file: z.string().nullable().optional(),
  published: z.boolean().default(false),
});

export const projectSchema = z.object({
  title: z.string().min(1).max(255),
  slug: slugSchema,
  summary: z.string().max(500),
  description: z.string().default(""),
  cover_image: z.string().nullable().optional(),
  project_url: z.string().url().nullable().optional(),
  repository_url: z.string().url().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  status: projectStatusSchema.default("PLANNED"),
  featured: z.boolean().default(false),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: "Start date must be before or equal to end date",
  path: ["start_date"],
});

export const contentQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
});

type ContentQuery = z.infer<typeof contentQuerySchema>;

// Basic Public Queries Foundation (using service client for now, could use anonymous client based on RLS)
export async function getPublicCompetitions(query: ContentQuery) {
  const q = contentQuerySchema.parse(query);
  const supabase = serviceClient();
  let dbQuery = supabase.from("competitions").select("*", { count: "exact" });
  
  if (q.search) {
    dbQuery = dbQuery.ilike("title", `%${q.search}%`);
  }
  if (q.status) {
    dbQuery = dbQuery.eq("status", q.status as z.infer<typeof competitionStatusSchema>);
  }
  if (q.category) {
    dbQuery = dbQuery.eq("category", q.category);
  }
  if (q.level) {
    dbQuery = dbQuery.eq("level", q.level);
  }

  const { data, error, count } = await dbQuery
    .order("created_at", { ascending: false })
    .range((q.page - 1) * q.page_size, q.page * q.page_size - 1);

  if (error) throw new AppError("SERVICE_UNAVAILABLE");

  return {
    data,
    meta: paginationMeta(q.page, q.page_size, count || 0),
  };
}

export async function getPublicAchievements(query: ContentQuery) {
  const q = contentQuerySchema.parse(query);
  const supabase = serviceClient();
  let dbQuery = supabase
    .from("achievements")
    .select("*, achievement_members(member_name, role)", { count: "exact" })
    .eq("published", true);
  
  if (q.search) {
    dbQuery = dbQuery.ilike("title", `%${q.search}%`);
  }
  if (q.level) {
    dbQuery = dbQuery.eq("level", q.level);
  }

  const { data, error, count } = await dbQuery
    .order("achievement_date", { ascending: false })
    .range((q.page - 1) * q.page_size, q.page * q.page_size - 1);

  if (error) throw new AppError("SERVICE_UNAVAILABLE");

  return {
    data,
    meta: paginationMeta(q.page, q.page_size, count || 0),
  };
}

export async function getPublicProjects(query: ContentQuery) {
  const q = contentQuerySchema.parse(query);
  const supabase = serviceClient();
  let dbQuery = supabase
    .from("projects")
    .select("*, project_members(member_name, role)", { count: "exact" });
  
  if (q.search) {
    dbQuery = dbQuery.ilike("title", `%${q.search}%`);
  }
  if (q.status) {
    dbQuery = dbQuery.eq("status", q.status as z.infer<typeof projectStatusSchema>);
  }

  const { data, error, count } = await dbQuery
    .order("start_date", { ascending: false })
    .range((q.page - 1) * q.page_size, q.page * q.page_size - 1);

  if (error) throw new AppError("SERVICE_UNAVAILABLE");

  return {
    data,
    meta: paginationMeta(q.page, q.page_size, count || 0),
  };
}
