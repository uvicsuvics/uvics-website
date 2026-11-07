import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin, revalidatePath, client, redirect } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  client: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({ serverClient: async () => client }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));

import {
  archivePageAction,
  createPageAction,
  publishPageAction,
  updatePageAction,
} from "@/app/admin/(protected)/pages/actions";
import { createProgramAction, updateProgramAction } from "@/app/admin/(protected)/programs/actions";
import { updateSettingsAction } from "@/app/admin/(protected)/settings/actions";
import { loadForAdmin } from "@/lib/admin/server";
import { AppError } from "@/lib/backend/errors";

const ID = "00000000-0000-4000-8000-000000000801";
const ts = "2026-11-08T03:00:00+00:00";
const pageRow = {
  id: ID,
  title: "Tentang",
  slug: "tentang",
  content: "Isi",
  meta_title: null,
  meta_description: null,
  status: "DRAFT",
  published_at: null,
  created_at: ts,
  updated_at: ts,
};
const programRow = {
  id: ID,
  name: "KABEL",
  slug: "kabel",
  short_description: null,
  description: "",
  image: null,
  status: "DRAFT",
  display_order: 3,
  created_at: ts,
  updated_at: ts,
};
const pageInput = { title: "Tentang", slug: "tentang", content: "Isi", meta_title: null, meta_description: null };

beforeEach(() => {
  vi.clearAllMocks();
  requireAdmin.mockResolvedValue({ id: "admin", name: "Admin", sessionId: "s" });
});

describe("Server Action halaman", () => {
  it("create mengembalikan id dan me-refresh daftar", async () => {
    client.rpc.mockResolvedValue({ data: pageRow, error: null });
    expect(await createPageAction(pageInput)).toEqual({ ok: true, data: { id: ID } });
    expect(client.rpc).toHaveBeenCalledWith("create_page", { p_values: { ...pageInput } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/pages", "layout");
  });

  it("slug duplikat menjadi CONFLICT tanpa teks database", async () => {
    client.rpc.mockResolvedValue({
      data: null,
      error: { code: "23505", message: 'duplicate key value violates unique constraint "pages_slug_key"' },
    });
    const result = await createPageAction(pageInput);
    expect(result).toMatchObject({ ok: false, error: { code: "CONFLICT" } });
    expect(JSON.stringify(result)).not.toMatch(/duplicate|pages_slug_key/);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("sesi bukan admin ditolak tanpa memanggil RPC", async () => {
    requireAdmin.mockRejectedValue(new AppError("FORBIDDEN"));
    expect(await updatePageAction(ID, { title: "Baru" })).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("galat tak dikenal menjadi INTERNAL_ERROR dengan pesan umum", async () => {
    requireAdmin.mockRejectedValue(new Error("relation public.pages does not exist"));
    const result = await publishPageAction(ID);
    expect(result).toEqual({
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan. Silakan coba kembali." },
    });
  });

  it("update, terbit, dan arsip memanggil RPC ter-audit", async () => {
    client.rpc.mockResolvedValue({ data: pageRow, error: null });
    client.from.mockReturnValue({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: pageRow, error: null }) }) }),
    });
    expect(await updatePageAction(ID, { title: "Baru" })).toEqual({ ok: true, data: null });
    expect(await publishPageAction(ID)).toEqual({ ok: true, data: null });
    expect(await archivePageAction(ID)).toEqual({ ok: true, data: null });
    expect(client.rpc.mock.calls.map(([name]) => name)).toEqual(["update_page", "publish_page", "archive_page"]);
  });

  it("validasi server mengembalikan field_errors tanpa memanggil RPC", async () => {
    const result = await createPageAction({ ...pageInput, slug: "Bukan Slug" });
    expect(result).toMatchObject({ ok: false, error: { code: "VALIDATION_ERROR" } });
    expect(result.ok ? [] : Object.keys(result.error.field_errors ?? {})).toEqual(["slug"]);
    expect(client.rpc).not.toHaveBeenCalled();
  });
});

describe("Server Action program", () => {
  it("create dan update meneruskan urutan tampil", async () => {
    client.rpc.mockResolvedValue({ data: programRow, error: null });
    const input = { name: "KABEL", slug: "kabel", short_description: null, description: "", display_order: 3 };
    expect(await createProgramAction(input)).toEqual({ ok: true, data: { id: ID } });
    expect(await updateProgramAction(ID, { display_order: 4 })).toEqual({ ok: true, data: null });
    expect(client.rpc).toHaveBeenLastCalledWith("update_program", { p_id: ID, p_changes: { display_order: 4 } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/programs", "layout");
  });
});

describe("Server Action pengaturan", () => {
  it("menyimpan key yang diizinkan", async () => {
    client.rpc.mockResolvedValue({
      data: [{ key: "registration_open", value: true, updated_at: ts, updated_by: null }],
      error: null,
    });
    expect(await updateSettingsAction({ registration_open: true })).toEqual({ ok: true, data: null });
    expect(client.rpc).toHaveBeenCalledWith("update_website_settings", { p_values: { registration_open: true } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/settings", "layout");
  });

  it("key di luar allowlist ditolak sebelum RPC", async () => {
    expect(await updateSettingsAction({ secret_key: "x" })).toMatchObject({
      ok: false,
      error: { code: "VALIDATION_ERROR" },
    });
    expect(client.rpc).not.toHaveBeenCalled();
  });
});

describe("loadForAdmin", () => {
  it("mengembalikan data atau galat aman", async () => {
    expect(await loadForAdmin(async () => 1)).toEqual({ ok: true, data: 1 });
    expect(await loadForAdmin(async () => Promise.reject(new AppError("NOT_FOUND")))).toMatchObject({
      ok: false,
      error: { code: "NOT_FOUND" },
    });
  });

  it("sesi kedaluwarsa diarahkan ke login", async () => {
    await expect(loadForAdmin(async () => Promise.reject(new AppError("UNAUTHENTICATED")))).rejects.toThrow(
      "NEXT_REDIRECT:/admin/login",
    );
  });
});
