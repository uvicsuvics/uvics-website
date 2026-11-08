import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { listAdminSettings } = vi.hoisted(() => ({
  listAdminSettings: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ serverClient: async () => ({}) }));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/lib/backend/settings", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/backend/settings")>()),
  listAdminSettings,
}));

import AdminSettingsPage from "@/app/admin/(protected)/settings/page";
import { cmsErrorMap } from "@/lib/admin/cms";
import {
  changedSettings,
  settingsFormSchema,
  settingsToForm,
  type SettingsFormValues,
} from "@/lib/admin/settings";

const ts = "2026-11-08T03:00:00.000Z";
const row = (key: string, value: unknown) => ({
  key,
  value,
  updated_at: ts,
  updated_by: null,
});
const empty = settingsToForm([]);

beforeEach(() => vi.clearAllMocks());

describe("settingsToForm", () => {
  it("hanya memakai key K5 dengan tipe yang benar", () => {
    const form = settingsToForm([
      row("organization_name", "UVICS"),
      row("registration_open", true),
      row("website_title", 42),
      row("maintenance_mode", true),
      row("logo", "/logo/logo_uvics.webp"),
    ]);
    expect(form.organization_name).toBe("UVICS");
    expect(form.registration_open).toBe(true);
    expect(form.website_title).toBe("");
    expect(Object.keys(form)).not.toContain("maintenance_mode");
    expect(Object.keys(form)).not.toContain("logo");
    expect(Object.keys(form)).toHaveLength(13);
  });
});

describe("changedSettings", () => {
  const initial: SettingsFormValues = {
    ...empty,
    organization_name: "UVICS",
    instagram_url: "https://instagram.com/uvics",
  };

  it("hanya mengirim key yang berubah, dirapikan, dengan boolean tetap boolean", () => {
    expect(
      changedSettings(initial, {
        ...initial,
        organization_name: " UVICS ",
        phone: "0812-3456 7890",
        registration_open: true,
      }),
    ).toEqual({
      changes: { phone: "+6281234567890", registration_open: true },
      cleared: [],
    });
  });

  it("mengosongkan key yang sudah berisi dilaporkan, bukan dikirim", () => {
    expect(
      changedSettings(initial, { ...initial, instagram_url: "  " }),
    ).toEqual({
      changes: {},
      cleared: ["instagram_url"],
    });
  });
});

describe("settingsFormSchema mengikuti read_public_settings()", () => {
  const issues = (values: Partial<SettingsFormValues>) => {
    const result = settingsFormSchema.safeParse(
      { ...empty, ...values },
      { error: cmsErrorMap },
    );
    return result.success
      ? {}
      : Object.fromEntries(
          result.error.issues.map((i) => [i.path[0], i.message]),
        );
  };

  it("menerima form kosong dan nilai yang tampil publik", () => {
    expect(issues({})).toEqual({});
    expect(
      issues({
        organization_name: "UVICS (Unklab Virtue In Computer Science)",
        email: "uvics@example.ac.id",
        phone: "081234567890",
        instagram_url: "https://www.instagram.com/uvics/",
      }),
    ).toEqual({});
  });

  it("menolak nilai yang akan disembunyikan reader publik", () => {
    expect(
      issues({
        website_title: "!!!",
        email: "bukan-email",
        phone: "12345",
        instagram_url: "https://instagram.com:8443/uvics",
        github_url: "https://xn--80ak6aa92e.com",
        youtube_url: "www.youtube.com",
      }),
    ).toEqual({
      website_title: "Wajib memuat huruf atau angka, maksimal 255 karakter.",
      email: "Masukkan email yang valid, misalnya nama@domain.ac.id.",
      phone: "Awali dengan kode negara, misalnya +6281234567890, atau 08.",
      instagram_url: "Masukkan URL lengkap yang diawali https://, tanpa port.",
      github_url: "Masukkan URL lengkap yang diawali https://, tanpa port.",
      youtube_url: "Masukkan URL lengkap yang diawali https://, tanpa port.",
    });
  });
});

describe("/admin/settings", () => {
  it("merender grup K5 dengan nilai tersimpan dan switch pendaftaran", async () => {
    listAdminSettings.mockResolvedValue([
      row("organization_name", "UVICS"),
      row("registration_open", false),
    ]);
    const html = renderToStaticMarkup(await AdminSettingsPage());
    for (const group of [
      "Identitas",
      "Kontak",
      "Media sosial",
      "SEO",
      "Pendaftaran",
    ])
      expect(html).toContain(group);
    expect(html).toContain('value="UVICS"');
    expect(html).toMatch(/role="switch"[^>]*aria-checked="false"/);
    expect(html).not.toMatch(/maintenance|favicon/);
  });

  it("galat memuat tampil aman", async () => {
    listAdminSettings.mockRejectedValue(
      new Error("permission denied for table website_settings"),
    );
    const html = renderToStaticMarkup(await AdminSettingsPage());
    expect(html).toContain('role="alert"');
    expect(html).not.toContain("permission denied");
  });
});
