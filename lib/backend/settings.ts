import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { websiteSettingsSchema } from "./cms";
import { toPublicSettings, type PublicSettings } from "./dto";
import { AppError, databaseError } from "./errors";
import { datetimeSchema, phoneSchema } from "./validation";

export { websiteSettingsSchema };

const field = websiteSettingsSchema.shape;

/**
 * Input Pengaturan Website dari admin: tanpa logo/favicon (D44), telepon "08..."
 * dinormalisasi ke "+62" (D04), dan null mengosongkan key teks kecuali identitas wajib (K2).
 * SQL menolak nilai yang tidak akan tampil di read_public_settings().
 */
export const adminSettingsInputSchema = websiteSettingsSchema.omit({ logo: true, favicon: true }).extend({
  email: field.email.nullable(),
  phone: phoneSchema.nullable().optional(),
  address: field.address.nullable(),
  instagram_url: field.instagram_url.nullable(),
  linkedin_url: field.linkedin_url.nullable(),
  github_url: field.github_url.nullable(),
  youtube_url: field.youtube_url.nullable(),
  footer_text: field.footer_text.nullable(),
  default_meta_title: field.default_meta_title.nullable(),
  default_meta_description: field.default_meta_description.nullable(),
});

export const adminSettingDto = z.object({
  key: z.string(),
  value: z.unknown(),
  updated_at: datetimeSchema,
  updated_by: z.string().nullable(),
});

export type AdminSettingDto = z.output<typeof adminSettingDto>;

/**
 * Membaca seluruh setting publik yang aman dan lolos validasi allowlist
 * melalui reader SQL read_public_settings() dan DTO toPublicSettings().
 */
export async function getPublicSettings(
  client: SupabaseClient<Database>,
): Promise<PublicSettings> {
  const { data, error } = await client.rpc("read_public_settings");
  if (error) databaseError(error);
  return toPublicSettings(data);
}

/**
 * Membaca seluruh baris settings untuk admin aktif.
 */
export async function listAdminSettings(
  client: SupabaseClient<Database>,
): Promise<AdminSettingDto[]> {
  await requireAdmin(client);

  const { data, error } = await client
    .from("website_settings")
    .select("key, value, updated_at, updated_by")
    .order("key", { ascending: true });

  if (error) databaseError(error);

  return (data ?? []).map((row) => {
    const parsed = adminSettingDto.safeParse(row);
    if (!parsed.success) throw new AppError("SERVICE_UNAVAILABLE");
    return parsed.data;
  });
}

/**
 * Melakukan pembaruan settings website oleh admin aktif secara atomik
 * melalui RPC update_website_settings().
 */
export async function updateWebsiteSettings(
  client: SupabaseClient<Database>,
  values: unknown,
): Promise<AdminSettingDto[]> {
  await requireAdmin(client);

  if (!values || typeof values !== "object" || Object.keys(values).length === 0) {
    throw new AppError("VALIDATION_ERROR");
  }

  const parsed = adminSettingsInputSchema.safeParse(values);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", {
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const { data, error } = await client.rpc("update_website_settings", {
    p_values: parsed.data,
  });

  if (error) databaseError(error);

  if (!Array.isArray(data)) throw new AppError("SERVICE_UNAVAILABLE");

  return data.map((row) => {
    const result = adminSettingDto.safeParse(row);
    if (!result.success) throw new AppError("SERVICE_UNAVAILABLE");
    return result.data;
  });
}
