import { z } from "zod";
import { phoneSchema } from "@/lib/backend/validation";

/**
 * Key pengaturan yang tampil di admin (K5). `maintenance_mode` belum punya konsumen,
 * `logo` dan `favicon` menunggu jalur media CMS (K3); nilainya tidak disentuh.
 */
const TEXT_KEYS = [
  "organization_name",
  "website_title",
  "footer_text",
  "email",
  "phone",
  "address",
  "instagram_url",
  "linkedin_url",
  "github_url",
  "youtube_url",
  "default_meta_title",
  "default_meta_description",
] as const;
type TextKey = (typeof TEXT_KEYS)[number];

export type SettingsFormValues = Record<TextKey, string> & {
  registration_open: boolean;
};
export type SettingsKey = keyof SettingsFormValues;
export const SETTINGS_KEYS: readonly SettingsKey[] = [
  ...TEXT_KEYS,
  "registration_open",
];

export const SETTINGS_CLEARED_MESSAGE =
  "Belum bisa dikosongkan. Isi nilai baru atau kembalikan nilai lama.";

// Validasi klien mengikuti reader publik read_public_settings() (D03) agar nilai yang
// tersimpan tidak diam-diam disembunyikan di website. Ubah bersama migration reader.
const text = (max: number) =>
  z
    .string()
    .refine(
      (value) =>
        value.trim() === "" ||
        (value.trim().length <= max && /[\p{L}\p{N}]/u.test(value)),
    );
const PUBLIC_URL =
  /^https?:\/\/((?![Xx][Nn]--)[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}([/?#][!-~]*)?$/;
const url = z
  .string()
  .refine(
    (value) =>
      value.trim() === "" ||
      (value.trim().length <= 2048 && PUBLIC_URL.test(value.trim())),
  );
const email = z
  .string()
  .refine(
    (value) =>
      value.trim() === "" || z.email().max(254).safeParse(value.trim()).success,
  );
const phone = z
  .string()
  .refine(
    (value) => value.trim() === "" || phoneSchema.safeParse(value).success,
  );

export const settingsFormSchema = z.object({
  organization_name: text(255),
  website_title: text(255),
  footer_text: text(500),
  email,
  phone,
  address: text(500),
  instagram_url: url,
  linkedin_url: url,
  github_url: url,
  youtube_url: url,
  default_meta_title: text(255),
  default_meta_description: text(500),
  registration_open: z.boolean(),
});

/** Baris `listAdminSettings` menjadi nilai form; key lain dan nilai bertipe salah diabaikan. */
export function settingsToForm(
  rows: ReadonlyArray<{ key: string; value: unknown }>,
): SettingsFormValues {
  const form: SettingsFormValues = {
    ...(Object.fromEntries(TEXT_KEYS.map((key) => [key, ""])) as Record<
      TextKey,
      string
    >),
    registration_open: false,
  };
  for (const { key, value } of rows) {
    if (key === "registration_open") form.registration_open = value === true;
    else if (
      (TEXT_KEYS as readonly string[]).includes(key) &&
      typeof value === "string"
    )
      form[key as TextKey] = value;
  }
  return form;
}

/** `08...` dinormalisasi menjadi `+628...` (D04); nilai lain hanya dirapikan. */
function normalized(key: TextKey, value: string): string {
  const parsed = key === "phone" ? phoneSchema.safeParse(value) : undefined;
  return parsed?.success ? parsed.data : value.trim();
}

/**
 * Hanya key yang berubah yang dikirim, karena setiap key yang dikirim ditulis ulang dan diaudit.
 * Key berisi yang dikosongkan dilaporkan di `cleared`: kontrak #30 belum bisa menghapus nilai.
 */
export function changedSettings(
  initial: SettingsFormValues,
  values: SettingsFormValues,
): { changes: Partial<SettingsFormValues>; cleared: TextKey[] } {
  const changes: Partial<SettingsFormValues> = {};
  const cleared: TextKey[] = [];
  if (values.registration_open !== initial.registration_open)
    changes.registration_open = values.registration_open;
  for (const key of TEXT_KEYS) {
    const next = normalized(key, values[key]);
    if (next === initial[key]) continue;
    if (next === "") cleared.push(key);
    else changes[key] = next;
  }
  return { changes, cleared };
}
