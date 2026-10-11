import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { AppError, databaseError } from "./errors";

// Define schema for safe values if necessary
export const settingValueSchema = z.any(); // Depending on setting, we could restrict this

// Only these keys are allowed to be queried by the public
export const PUBLIC_SETTINGS_KEYS = [
  "site_name",
  "site_description",
  "contact_email",
  "social_links",
  "footer_text",
] as const;

export type PublicSettingKey = typeof PUBLIC_SETTINGS_KEYS[number];

export const adminSettingDto = z.object({
  key: z.string(),
  value: z.any(),
  updated_at: z.string(),
  updated_by: z.string().nullable(),
});

export type AdminSettingDto = z.infer<typeof adminSettingDto>;

export async function getPublicSetting(client: SupabaseClient<Database>, key: PublicSettingKey): Promise<unknown> {
  if (!PUBLIC_SETTINGS_KEYS.includes(key)) {
    throw new AppError("FORBIDDEN"); // Safe error mapping
  }
  const { data, error } = await client
    .from("website_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    if (error.code === "P0002") return null; // Default to null if not found
    databaseError(error);
  }
  return data.value;
}

export async function getPublicSettings(client: SupabaseClient<Database>, keys: PublicSettingKey[]): Promise<Record<string, unknown>> {
  const safeKeys = keys.filter(k => PUBLIC_SETTINGS_KEYS.includes(k));
  if (safeKeys.length === 0) return {};

  const { data, error } = await client
    .from("website_settings")
    .select("key, value")
    .in("key", safeKeys);

  if (error) databaseError(error);

  const result: Record<string, unknown> = {};
  if (data) {
    data.forEach(row => {
      result[row.key] = row.value;
    });
  }
  return result;
}

export async function listAdminSettings(client: SupabaseClient<Database>): Promise<AdminSettingDto[]> {
  const { data, error } = await client
    .from("website_settings")
    .select("*")
    .order("key", { ascending: true });

  if (error) databaseError(error);
  return data as AdminSettingDto[];
}

export async function updateAdminSetting(client: SupabaseClient<Database>, key: string, value: unknown): Promise<AdminSettingDto> {
  // Validate key format based on db constraint: check(key ~ '^[a-z_]+$')
  if (!/^[a-z_]+$/.test(key)) {
    throw new AppError("VALIDATION_ERROR", { fieldErrors: { key: ["Invalid key format"] } });
  }

  const { data: old, error: errOld } = await client.from("website_settings").select("value").eq("key", key).single();
  if (errOld && errOld.code !== "P0002") databaseError(errOld);
  // It's okay if not found initially, we use UPSERT (but actually the RPC we will just use update or insert)
  // Let's use upsert for settings
  
  // Wait, the currently logged in admin's ID should be used for updated_by
  // Supabase takes care of updated_by? No, we might need to set it, or let the database handle it if there is a trigger, wait, the trigger `touch_updated_at` only updates `updated_at`.
  // To set `updated_by`, we can do it via the client or let it be handled by a trigger. Wait, `auth.uid()` isn't automatically linked unless we pass it.
  
  const { data: user, error: userError } = await client.auth.getUser();
  if (userError || !user.user) throw new AppError("UNAUTHENTICATED");

  const { data, error } = await client
    .from("website_settings")
    .upsert({ key, value: value as never, updated_by: user.user.id })
    .select()
    .single();

  if (error) databaseError(error);

  const { error: auditError } = await client.rpc("log_cms_audit", {
    p_action: "SETTING_UPDATED",
    p_entity_type: "website_setting",
    p_entity_id: user.user.id, // Using user ID since setting key is text, not uuid
    p_old: old ? { value: old.value } : {},
    p_new: { key, value: value as Json }
  });
  if (auditError) console.error("Failed to audit SETTING_UPDATED", auditError);

  return data as AdminSettingDto;
}
