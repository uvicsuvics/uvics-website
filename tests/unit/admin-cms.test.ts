import { describe, expect, it } from "vitest";
import { getAdminBreadcrumbs } from "@/config/admin-navigation";
import {
  callAction,
  cmsErrorMap,
  cmsFailureView,
  countByStatus,
  filterCmsItems,
  noticeMessage,
  pageFormSchema,
  programFormSchema,
  slugify,
  statusAction,
  toPagePayload,
  toProgramPayload,
} from "@/lib/admin/cms";
import { formatTimestamp } from "@/lib/format/date";
import { CONTENT_STATUS_LABELS } from "@/lib/format/labels";
import { Constants } from "@/types/database";

const ID = "00000000-0000-4000-8000-000000000801";

describe("label dan format admin CMS", () => {
  it("punya label untuk setiap content_status dengan urutan enum", () => {
    expect(Object.keys(CONTENT_STATUS_LABELS)).toEqual([...Constants.public.Enums.content_status]);
    expect(CONTENT_STATUS_LABELS).toEqual({ DRAFT: "Draf", PUBLISHED: "Terbit", ARCHIVED: "Diarsipkan" });
  });

  it("memformat timestamptz menurut tanggal WITA", () => {
    // 17:30 UTC sudah tanggal 8 di WITA (UTC+8).
    expect(formatTimestamp("2026-11-07T17:30:00Z")).toBe("8 Nov 2026");
    expect(formatTimestamp("2026-10-15T03:00:00.123456+00:00")).toBe("15 Okt 2026");
  });

  it("breadcrumb route edit memakai label Edit, bukan UUID", () => {
    expect(getAdminBreadcrumbs(`/admin/pages/${ID}`).map((c) => c.label)).toEqual(["Admin", "Halaman", "Edit"]);
    expect(getAdminBreadcrumbs("/admin/programs/new").at(-1)?.label).toBe("Tambah");
  });
});

describe("aksi status", () => {
  it("draf diterbitkan tanpa konfirmasi", () => {
    expect(statusAction("DRAFT", "halaman", "Tentang")).toEqual({ kind: "publish", label: "Terbitkan" });
  });

  it("arsip dan terbit ulang meminta konfirmasi", () => {
    expect(statusAction("PUBLISHED", "halaman", "Tentang")).toEqual({
      kind: "archive",
      label: "Arsipkan",
      confirm: {
        title: 'Arsipkan "Tentang"?',
        description: "Halaman tidak lagi tampil di website. Anda bisa menerbitkannya ulang kapan saja.",
        confirmLabel: "Arsipkan",
        tone: "danger",
      },
    });
    expect(statusAction("ARCHIVED", "program", "KABEL")).toMatchObject({
      kind: "publish",
      label: "Terbitkan ulang",
      confirm: { title: 'Terbitkan ulang "KABEL"?', description: "Program akan tampil lagi di website." },
    });
  });

  it("pesan sukses per notice, notice tak dikenal diabaikan", () => {
    expect(noticeMessage("created", "halaman")).toBe("Halaman berhasil dibuat sebagai Draf.");
    expect(noticeMessage("archived", "program")).toBe("Program berhasil diarsipkan.");
    expect(noticeMessage(undefined, "program")).toBeUndefined();
  });
});

describe("filter daftar CMS", () => {
  const items = [
    { title: "Tentang UVICS", slug: "tentang", status: "PUBLISHED" as const },
    { title: "Kebijakan Privasi", slug: "kebijakan-privasi", status: "DRAFT" as const },
    { title: "Rekrutmen", slug: "rekrutmen-batch-3", status: "ARCHIVED" as const },
  ];

  it("menyaring status dan mencari judul atau slug tanpa peka huruf besar", () => {
    expect(filterCmsItems(items, { status: "DRAFT" }).map((i) => i.slug)).toEqual(["kebijakan-privasi"]);
    expect(filterCmsItems(items, { search: "privasi" })).toHaveLength(1);
    expect(filterCmsItems(items, { search: "BATCH-3" })).toHaveLength(1);
    expect(filterCmsItems(items, { status: "PUBLISHED", search: "privasi" })).toEqual([]);
    expect(filterCmsItems(items, {})).toHaveLength(3);
  });

  it("menghitung per status untuk tab filter", () => {
    expect(countByStatus(items)).toEqual({ ALL: 3, DRAFT: 1, PUBLISHED: 1, ARCHIVED: 1 });
  });
});

describe("pemetaan galat form", () => {
  const rendered = ["title", "slug", "content"] as const;

  it("galat field server memakai pesan Indonesia milik frontend", () => {
    const view = cmsFailureView(
      {
        code: "VALIDATION_ERROR",
        message: "Periksa kembali data yang diisi.",
        field_errors: { slug: ["Invalid string: must match pattern /^[a-z0-9]+$/"], extra: ["x"] },
      },
      rendered,
    );
    expect(view).toEqual({
      kind: "fields",
      fields: [["slug", "Gunakan huruf kecil, angka, dan tanda hubung, misalnya tentang-kami."]],
    });
  });

  it("CONFLICT saat simpan menjadi galat slug", () => {
    expect(
      cmsFailureView({ code: "CONFLICT", message: "Data telah berubah. Muat ulang dan coba kembali." }, rendered, "slug"),
    ).toEqual({ kind: "fields", fields: [["slug", "Slug sudah dipakai. Pilih slug lain."]] });
  });

  it("galat tanpa field menjadi banner dengan pesan aman", () => {
    expect(
      cmsFailureView({ code: "SERVICE_UNAVAILABLE", message: "Layanan sementara tidak tersedia. Silakan coba kembali." }, rendered),
    ).toEqual({ kind: "banner", message: "Layanan sementara tidak tersedia. Silakan coba kembali." });
  });
});

describe("saran slug", () => {
  it("mengubah judul menjadi slug kebab-case yang lolos skema", () => {
    expect(slugify("Visi & Misi UVICS")).toBe("visi-misi-uvics");
    expect(slugify("  Kebijakan  Privasi 2026! ")).toBe("kebijakan-privasi-2026");
    expect(slugify("Café Été")).toBe("cafe-ete");
    expect(slugify("x".repeat(200))).toHaveLength(160);
    expect(slugify("---")).toBe("");
  });
});

describe("skema dan payload form", () => {
  it("skema halaman menolak slug tidak valid dengan pesan Indonesia", () => {
    const result = pageFormSchema.safeParse(
      { title: "", slug: "Tentang Kami", content: "", meta_title: "", meta_description: "" },
      { error: cmsErrorMap },
    );
    expect(result.success).toBe(false);
    const issues = result.success ? {} : Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message]));
    expect(issues).toEqual({
      title: "Judul wajib diisi, maksimal 255 karakter.",
      slug: "Gunakan huruf kecil, angka, dan tanda hubung, misalnya tentang-kami.",
    });
  });

  it("payload mengubah meta kosong menjadi null dan merapikan judul", () => {
    expect(
      toPagePayload({ title: " Tentang ", slug: "tentang", content: "Isi", meta_title: " ", meta_description: "Ringkas" }),
    ).toEqual({ title: "Tentang", slug: "tentang", content: "Isi", meta_title: null, meta_description: "Ringkas" });
  });

  it("skema program menolak urutan bukan bilangan bulat", () => {
    const base = { name: "KABEL", slug: "kabel", short_description: "", description: "" };
    expect(programFormSchema.safeParse({ ...base, display_order: 3 }).success).toBe(true);
    const bad = programFormSchema.safeParse({ ...base, display_order: Number.NaN }, { error: cmsErrorMap });
    expect(bad.success ? "" : bad.error.issues[0].message).toBe("Isi dengan bilangan bulat.");
    expect(toProgramPayload({ ...base, display_order: 3 })).toEqual({
      name: "KABEL",
      slug: "kabel",
      short_description: null,
      description: "",
      display_order: 3,
    });
  });
});

describe("pemanggilan Server Action dari klien", () => {
  it("galat jaringan menjadi hasil gagal dengan pesan aman, bukan exception", async () => {
    const result = await callAction(() => Promise.reject(new TypeError("Failed to fetch")));
    expect(result).toMatchObject({ ok: false, error: { code: "SERVICE_UNAVAILABLE" } });
    expect(result.ok ? "" : result.error.message).toMatch(/^Gagal terhubung ke server/);
    expect(JSON.stringify(result)).not.toContain("Failed to fetch");
  });

  it("hasil Server Action diteruskan apa adanya", async () => {
    const ok = { ok: true as const, data: { id: ID } };
    expect(await callAction(() => Promise.resolve(ok))).toBe(ok);
  });
});
