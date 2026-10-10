import { z } from "zod";
import { paginationSchema } from "./validation";

export const contentStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const slugSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug hanya boleh berisi huruf kecil, angka, dan strip.",
  });

export const pageSchema = z.object({
  title: z.string().min(1).max(255),
  slug: slugSchema,
  content: z.string().default(""),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
  status: contentStatusSchema.default("DRAFT"),
});

export const programSchema = z.object({
  name: z.string().min(1).max(255),
  slug: slugSchema,
  short_description: z.string().max(500).nullable().optional(),
  description: z.string().default(""),
  image: z.string().nullable().optional(),
  status: contentStatusSchema.default("DRAFT"),
  display_order: z.number().int().default(0),
});

export const websiteSettingsSchema = z.object({
  organization_name: z.string().nullable().optional(),
  website_title: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  favicon: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  instagram_url: z.string().url().nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  github_url: z.string().url().nullable().optional(),
  youtube_url: z.string().url().nullable().optional(),
  footer_text: z.string().nullable().optional(),
  default_meta_title: z.string().nullable().optional(),
  default_meta_description: z.string().nullable().optional(),
  registration_open: z.boolean().nullable().optional(),
});

export const getPagesQuerySchema = paginationSchema.extend({
  status: contentStatusSchema.optional(),
});

export const getProgramsQuerySchema = paginationSchema.extend({
  status: contentStatusSchema.optional(),
});

export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type Page = z.infer<typeof pageSchema> & {
  id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
export type Program = z.infer<typeof programSchema> & {
  id: string;
  created_at: string;
  updated_at: string;
};
export type WebsiteSettings = z.infer<typeof websiteSettingsSchema>;
