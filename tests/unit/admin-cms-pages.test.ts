import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { backend, notFound } = vi.hoisted(() => ({
  backend: {
    listAdminPages: vi.fn(),
    getAdminPage: vi.fn(),
    listAdminPrograms: vi.fn(),
    getAdminProgram: vi.fn(),
  },
  notFound: vi.fn(() => {
    throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
  }),
}));
vi.mock("@/lib/supabase/server", () => ({ serverClient: async () => ({}) }));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  notFound,
  redirect: vi.fn(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/lib/backend/pages", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/backend/pages")>()),
  listAdminPages: backend.listAdminPages,
  getAdminPage: backend.getAdminPage,
}));
vi.mock("@/lib/backend/programs", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/backend/programs")>()),
  listAdminPrograms: backend.listAdminPrograms,
  getAdminProgram: backend.getAdminProgram,
}));

import EditPagePage from "@/app/admin/(protected)/pages/[id]/page";
import NewPagePage from "@/app/admin/(protected)/pages/new/page";
import AdminPagesPage from "@/app/admin/(protected)/pages/page";
import EditProgramPage from "@/app/admin/(protected)/programs/[id]/page";
import AdminProgramsPage from "@/app/admin/(protected)/programs/page";
import { AppError } from "@/lib/backend/errors";

const ID = "00000000-0000-4000-8000-000000000801";
const ID2 = "00000000-0000-4000-8000-000000000802";
const page = (overrides = {}) => ({
  id: ID,
  title: "Tentang UVICS",
  slug: "tentang",
  content: "Isi",
  meta_title: null,
  meta_description: null,
  status: "PUBLISHED",
  published_at: "2026-11-06T02:00:00.000Z",
  created_at: "2026-10-01T02:00:00.000Z",
  updated_at: "2026-11-07T17:30:00.000Z",
  ...overrides,
});
const program = (overrides = {}) => ({
  id: ID,
  name: "KABEL (Kamar Belajar)",
  slug: "kabel",
  short_description: "Belajar bersama",
  description: "",
  image: null,
  status: "DRAFT",
  display_order: 3,
  created_at: "2026-10-01T02:00:00.000Z",
  updated_at: "2026-11-07T17:30:00.000Z",
  ...overrides,
});

const sp = (params: Record<string, string> = {}) => Promise.resolve(params);
const renderList = async (params?: Record<string, string>) =>
  renderToStaticMarkup(await AdminPagesPage({ searchParams: sp(params) }));

beforeEach(() => vi.clearAllMocks());

describe("/admin/pages", () => {
  it("menampilkan daftar dengan status, tanggal WITA, dan aksi sesuai status", async () => {
    backend.listAdminPages.mockResolvedValue([
      page(),
      page({ id: ID2, title: "Kebijakan Privasi", slug: "kebijakan-privasi", status: "DRAFT" }),
    ]);
    const html = await renderList();
    expect(html).toContain("<h1");
    expect(html).toContain(`href="/admin/pages/${ID}"`);
    expect(html).toContain("/kebijakan-privasi");
    expect(html).toContain("8 Nov 2026");
    expect(html).toContain('aria-label="Arsipkan Tentang UVICS"');
    expect(html).toContain('aria-label="Terbitkan Kebijakan Privasi"');
    expect(html).toContain('href="/admin/pages/new"');
    expect(html).not.toContain("Tahap Pengembangan CMS");
  });

  it("tab status menyimpan pencarian dan menandai filter aktif", async () => {
    backend.listAdminPages.mockResolvedValue([page()]);
    const html = await renderList({ status: "PUBLISHED", search: "tentang" });
    const tab = (href: string) => html.match(new RegExp(`<a[^>]*href="${href}"[^>]*>`))?.[0] ?? "";
    expect(tab("/admin/pages\\?status=PUBLISHED&amp;search=tentang")).toContain('aria-current="page"');
    expect(tab("/admin/pages\\?status=DRAFT&amp;search=tentang")).not.toContain("aria-current");
  });

  it("menampilkan banner sukses dari notice dan mengabaikan notice asing", async () => {
    backend.listAdminPages.mockResolvedValue([page()]);
    expect(await renderList({ notice: "published" })).toContain("Halaman berhasil diterbitkan.");
    expect(await renderList({ notice: "<script>" })).not.toContain('role="status"');
  });

  it("kosong tanpa data mengajak membuat halaman", async () => {
    backend.listAdminPages.mockResolvedValue([]);
    const html = await renderList();
    expect(html).toContain("Belum ada halaman");
    expect(html).toContain('href="/admin/pages/new"');
  });

  it("filter tanpa hasil menawarkan hapus filter", async () => {
    backend.listAdminPages.mockResolvedValue([page()]);
    const html = await renderList({ search: "tidak-ada" });
    expect(html).toContain("Tidak ada halaman yang cocok");
    expect(html).toMatch(/href="\/admin\/pages"[^>]*>Hapus filter/);
  });

  it("galat memuat tampil aman tanpa teks database", async () => {
    backend.listAdminPages.mockRejectedValue(new Error('relation "public.pages" does not exist'));
    const html = await renderList();
    expect(html).toContain('role="alert"');
    expect(html).toContain("Terjadi kesalahan. Silakan coba kembali.");
    expect(html).not.toContain("relation");
  });
});

describe("/admin/pages/new dan /admin/pages/[id]", () => {
  it("form baru disimpan sebagai draf", async () => {
    const html = renderToStaticMarkup(await NewPagePage());
    expect(html).toContain("Tambah halaman");
    expect(html).toContain("Simpan sebagai draf");
    expect(html).toContain('for="page-slug"');
  });

  it("form edit halaman terbit memberi peringatan dan aksi arsip", async () => {
    backend.getAdminPage.mockResolvedValue(page());
    const html = renderToStaticMarkup(
      await EditPagePage({ params: Promise.resolve({ id: ID }), searchParams: sp({ notice: "saved" }) }),
    );
    expect(html).toContain('value="Tentang UVICS"');
    expect(html).toContain("langsung tampil di website");
    expect(html).toContain("Perubahan berhasil disimpan.");
    expect(html).toContain('aria-label="Arsipkan Tentang UVICS"');
  });

  it("id tidak dikenal menjadi 404", async () => {
    backend.getAdminPage.mockRejectedValue(new AppError("NOT_FOUND"));
    await expect(EditPagePage({ params: Promise.resolve({ id: "x" }), searchParams: sp() })).rejects.toThrow("404");
    expect(notFound).toHaveBeenCalled();
  });
});

describe("/admin/programs", () => {
  it("menampilkan urutan tampil dan aksi terbit untuk draf", async () => {
    backend.listAdminPrograms.mockResolvedValue([program()]);
    const html = renderToStaticMarkup(await AdminProgramsPage({ searchParams: sp() }));
    expect(html).toContain("Urutan 3");
    expect(html).toContain('aria-label="Terbitkan KABEL (Kamar Belajar)"');
    expect(html).toContain('href="/admin/programs/new"');
  });

  it("form edit program memuat field kolom yang ada saja", async () => {
    backend.getAdminProgram.mockResolvedValue(program({ status: "ARCHIVED" }));
    const html = renderToStaticMarkup(
      await EditProgramPage({ params: Promise.resolve({ id: ID }), searchParams: sp() }),
    );
    expect(html).toContain('value="3"');
    expect(html).toContain('aria-label="Terbitkan ulang KABEL (Kamar Belajar)"');
    expect(html).not.toContain('name="image"');
  });
});
