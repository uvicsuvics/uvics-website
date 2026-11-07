import { z } from "zod";
import { pageSchema, programSchema } from "@/lib/backend/cms";
import type { OperationResult } from "@/lib/backend/errors";
import { CONTENT_STATUSES, type ContentStatus } from "@/types/cms";

/** Kata benda modul untuk teks UI; huruf kecil, dikapitalisasi bila perlu. */
export type CmsNoun = "halaman" | "program";
export type FailureError = Extract<
  OperationResult<never>,
  { ok: false }
>["error"];

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

// Pesan Indonesia per field; teks Zod dari server (Inggris) tidak pernah ditampilkan.
export const CMS_FIELD_MESSAGES: Record<string, string> = {
  title: "Judul wajib diisi, maksimal 255 karakter.",
  name: "Nama wajib diisi, maksimal 255 karakter.",
  slug: "Gunakan huruf kecil, angka, dan tanda hubung, misalnya tentang-kami.",
  meta_title: "Maksimal 255 karakter.",
  meta_description: "Maksimal 500 karakter.",
  short_description: "Maksimal 500 karakter.",
  display_order: "Isi dengan bilangan bulat.",
};
const FIELD_FALLBACK = "Periksa kembali isian ini.";
const SLUG_TAKEN = "Slug sudah dipakai. Pilih slug lain.";

/** Error map Zod untuk form admin CMS: satu pesan per field. */
export const cmsErrorMap: z.core.$ZodErrorMap = (issue) =>
  CMS_FIELD_MESSAGES[String(issue.path?.[0])] ?? FIELD_FALLBACK;

/**
 * Field form halaman: judul dan slug memakai skema backend; field opsional berupa string
 * (kosong menjadi null di `toPagePayload`). Status diubah lewat aksi terbit/arsip.
 */
export const pageFormSchema = z.object({
  title: pageSchema.shape.title,
  slug: pageSchema.shape.slug,
  content: z.string(),
  meta_title: z.string().max(255),
  meta_description: z.string().max(500),
});
export type PageFormValues = z.input<typeof pageFormSchema>;

/** Field form program: kolom yang ada (K2); `image` menunggu jalur media CMS (K3). */
export const programFormSchema = z.object({
  name: programSchema.shape.name,
  slug: programSchema.shape.slug,
  short_description: z.string().max(500),
  description: z.string(),
  display_order: z.number().int(),
});
export type ProgramFormValues = z.input<typeof programFormSchema>;

const orNull = (value: string) => value.trim() || null;

/** Saran slug dari judul: huruf kecil, tanpa diakritik, dipisah tanda hubung, maksimal 160 karakter. */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 160)
    .replace(/^-+|-+$/g, "");
}

export function toPagePayload(values: PageFormValues) {
  return {
    title: values.title.trim(),
    slug: values.slug,
    content: values.content,
    meta_title: orNull(values.meta_title),
    meta_description: orNull(values.meta_description),
  };
}

export function toProgramPayload(values: ProgramFormValues) {
  return {
    name: values.name.trim(),
    slug: values.slug,
    short_description: orNull(values.short_description),
    description: values.description,
    display_order: values.display_order,
  };
}

export type StatusAction = {
  kind: "publish" | "archive";
  label: string;
  confirm?: {
    title: string;
    description: string;
    confirmLabel: string;
    tone: "primary" | "danger";
  };
};

/** Satu aksi status per status saat ini: DRAFT terbit, PUBLISHED arsip, ARCHIVED terbit ulang. */
export function statusAction(
  status: ContentStatus,
  noun: CmsNoun,
  title: string,
): StatusAction {
  if (status === "DRAFT") return { kind: "publish", label: "Terbitkan" };
  if (status === "PUBLISHED")
    return {
      kind: "archive",
      label: "Arsipkan",
      confirm: {
        title: `Arsipkan "${title}"?`,
        description: `${capitalize(noun)} tidak lagi tampil di website. Anda bisa menerbitkannya ulang kapan saja.`,
        confirmLabel: "Arsipkan",
        tone: "danger",
      },
    };
  return {
    kind: "publish",
    label: "Terbitkan ulang",
    confirm: {
      title: `Terbitkan ulang "${title}"?`,
      description: `${capitalize(noun)} akan tampil lagi di website.`,
      confirmLabel: "Terbitkan ulang",
      tone: "primary",
    },
  };
}

const NOTICES = {
  created: (noun: CmsNoun) =>
    `${capitalize(noun)} berhasil dibuat sebagai Draf.`,
  saved: () => "Perubahan berhasil disimpan.",
  published: (noun: CmsNoun) => `${capitalize(noun)} berhasil diterbitkan.`,
  archived: (noun: CmsNoun) => `${capitalize(noun)} berhasil diarsipkan.`,
};
export type CmsNotice = keyof typeof NOTICES;
export const CMS_NOTICES = Object.keys(NOTICES) as CmsNotice[];

/** Pesan sukses dari parameter `notice`; nilai tak dikenal diabaikan. */
export function noticeMessage(
  notice: string | undefined,
  noun: CmsNoun,
): string | undefined {
  return notice && notice in NOTICES
    ? NOTICES[notice as CmsNotice](noun)
    : undefined;
}

type Listable = { title: string; slug: string; status: ContentStatus };

// shortcut: filter di memori atas seluruh hasil listAdmin* (daftar CMS kecil); pindah ke query backend bila melewati 100 baris.
export function filterCmsItems<T extends Listable>(
  items: readonly T[],
  { status, search }: { status?: ContentStatus; search?: string },
): T[] {
  const needle = search?.toLowerCase();
  return items.filter(
    (item) =>
      (!status || item.status === status) &&
      (!needle ||
        item.title.toLowerCase().includes(needle) ||
        item.slug.includes(needle)),
  );
}

export function countByStatus(
  items: readonly Listable[],
): Record<ContentStatus | "ALL", number> {
  const counts = { ALL: items.length } as Record<ContentStatus | "ALL", number>;
  for (const status of CONTENT_STATUSES)
    counts[status] = items.filter((item) => item.status === status).length;
  return counts;
}

export type FailureView<K extends string> =
  | { kind: "fields"; fields: Array<[K, string]> }
  | { kind: "banner"; message: string };

/**
 * Ubah hasil gagal Server Action menjadi galat field atau banner.
 * @param conflictField - Field yang ditandai bila server mengembalikan CONFLICT (slug unik).
 */
export function cmsFailureView<K extends string>(
  error: FailureError,
  rendered: readonly K[],
  conflictField?: K,
): FailureView<K> {
  if (error.code === "CONFLICT" && conflictField)
    return { kind: "fields", fields: [[conflictField, SLUG_TAKEN]] };
  const fields = rendered
    .filter((name) => error.field_errors?.[name]?.length)
    .map((name): [K, string] => [
      name,
      CMS_FIELD_MESSAGES[name] ?? FIELD_FALLBACK,
    ]);
  return fields.length
    ? { kind: "fields", fields }
    : { kind: "banner", message: error.message };
}
