import { z } from "zod";
import { Constants } from "@/types/database";
import { storedPhoneSchema } from "./membership";
import { slugSchema } from "./validation";

export const contentStatusSchema = z.enum(Constants.public.Enums.content_status);
// Tautan dirender ke publik: hanya http/https (menolak javascript:, data:).
export const httpUrlSchema = z.url({ protocol: /^https?$/ });

export const pageSchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: slugSchema,
  content: z.string().default(""),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
  status: contentStatusSchema.default("DRAFT"),
});

export const programSchema = z.object({
  name: z.string().trim().min(1).max(255),
  slug: slugSchema,
  short_description: z.string().max(500).nullable().optional(),
  description: z.string().default(""),
  image: z.string().nullable().optional(),
  status: contentStatusSchema.default("DRAFT"),
  display_order: z.number().int().default(0),
});

// Allowlist key issue #10; key lain ditolak.
export const websiteSettingsSchema = z
  .object({
    organization_name: z.string().max(255),
    website_title: z.string().max(255),
    logo: z.string(),
    favicon: z.string(),
    email: z.email(),
    phone: storedPhoneSchema,
    address: z.string().max(500),
    instagram_url: httpUrlSchema,
    linkedin_url: httpUrlSchema,
    github_url: httpUrlSchema,
    youtube_url: httpUrlSchema,
    footer_text: z.string().max(500),
    default_meta_title: z.string().max(255),
    default_meta_description: z.string().max(500),
    registration_open: z.boolean(),
  })
  .partial()
  .strict();
