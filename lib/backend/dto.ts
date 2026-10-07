import { z } from "zod";
import { AppError } from "./errors";
import { emailSchema, httpUrlSchema, phoneSchema } from "./validation";
import { publicImageSchema, type PublicImage } from "@/lib/media/public-image";

// ponytail: nama field input mengikuti rancangan PR16/PR17; diselaraskan ulang
// dengan schema kanonis pada gate T3 issue #31.
const publicMemberSource = z.object({
  full_name: z.string().min(1),
  // Foto non-PUBLIC atau malformed tidak pernah diteruskan; dianggap tidak ada.
  photo: publicImageSchema.nullable().catch(null),
  position_name: z.string().min(1),
  department_name: z.string().min(1),
});

export type PublicMember = {
  name: string;
  photo: PublicImage | null;
  position: string;
  department: string;
};

/**
 * Proyeksi member publik minimum (keputusan D02). Definisi ini tidak
 * mengaktifkan direktori publik dan tidak menandakan consent.
 */
export function toPublicMember(row: unknown): PublicMember {
  const parsed = publicMemberSource.safeParse(row);
  if (!parsed.success) throw new AppError("SERVICE_UNAVAILABLE");
  return {
    name: parsed.data.full_name,
    photo: parsed.data.photo,
    position: parsed.data.position_name,
    department: parsed.data.department_name,
  };
}

// Nilai malformed per key dibuang; key di luar allowlist di-strip oleh z.object.
function optional<T extends z.ZodType>(schema: T) {
  return schema.optional().catch(undefined);
}
const text = z.string().trim().min(1).max(500);
const publicSettingsSchema = z.object({
  organization_name: optional(text),
  website_title: optional(text),
  logo: optional(text),
  favicon: optional(text),
  footer_text: optional(z.string().trim().min(1).max(2000)),
  email: optional(emailSchema),
  phone: optional(phoneSchema),
  address: optional(text),
  instagram_url: optional(httpUrlSchema),
  linkedin_url: optional(httpUrlSchema),
  github_url: optional(httpUrlSchema),
  youtube_url: optional(httpUrlSchema),
  default_meta_title: optional(text),
  default_meta_description: optional(text),
  registration_open: optional(z.boolean()),
  maintenance_mode: optional(z.boolean()),
});
export type PublicSettings = z.output<typeof publicSettingsSchema>;

/**
 * Memvalidasi output `public.read_public_settings()`. Consumer wajib menafsirkan
 * `registration_open !== true` sebagai tertutup.
 */
export function toPublicSettings(raw: unknown): PublicSettings {
  const parsed = publicSettingsSchema.safeParse(raw);
  if (!parsed.success) throw new AppError("SERVICE_UNAVAILABLE");
  return parsed.data;
}
