import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const { requireAdmin } = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin }));

import { AppError } from "@/lib/backend/errors";
import {
  archivePage,
  createPage,
  getAdminPage,
  getPublicPageBySlug,
  listPublicPages,
  publishPage,
  updatePage,
} from "@/lib/backend/pages";
import { createProgram, listPublicPrograms, updateProgram } from "@/lib/backend/programs";
import { getPublicSettings, listAdminSettings, updateWebsiteSettings } from "@/lib/backend/settings";

type Result = { data: unknown; error: { code?: string } | null; count?: number | null };
const ok = (data: unknown, count?: number): Result => ({ data, error: null, count });
const fail = (code: string): Result => ({ data: null, error: { code } });

/** Client Supabase palsu: mencatat rantai query dan RPC, mengembalikan hasil yang disiapkan. */
function fakeClient({ query = ok(null), rpc = ok(null) }: { query?: Result; rpc?: Result } = {}) {
  const calls: Array<[string, unknown[]]> = [];
  const builder: Record<string, unknown> = {
    then: (resolve: (r: Result) => unknown, reject: (e: unknown) => unknown) => Promise.resolve(query).then(resolve, reject),
    maybeSingle: () => {
      calls.push(["maybeSingle", []]);
      return Promise.resolve(query);
    },
  };
  for (const method of ["select", "eq", "order", "range"])
    builder[method] = (...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    };
  const rpcFn = vi.fn(async () => rpc);
  const from = vi.fn((table: string) => {
    calls.push(["from", [table]]);
    return builder;
  });
  return { client: { from, rpc: rpcFn } as unknown as SupabaseClient<Database>, calls, rpc: rpcFn, from };
}

const ID = "00000000-0000-4000-8000-000000000801";
const pageRow = {
  id: ID,
  title: "Tentang",
  slug: "tentang",
  content: "<p>Isi</p>",
  meta_title: null,
  meta_description: null,
  status: "DRAFT",
  published_at: null,
  created_at: "2026-10-15T03:00:00.123456+00:00",
  updated_at: "2026-10-15T11:00:00+08:00",
};
const programRow = {
  id: ID,
  name: "Study Group",
  slug: "study-group",
  short_description: null,
  description: "Deskripsi",
  image: null,
  status: "DRAFT",
  display_order: 2,
  created_at: "2026-10-15T03:00:00+00:00",
  updated_at: "2026-10-15T03:00:00+00:00",
};

async function rejectsWith(promise: Promise<unknown>, code: string) {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(AppError);
  expect((error as AppError).code).toBe(code);
  return error as AppError;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireAdmin.mockResolvedValue({ id: "00000000-0000-4000-8000-000000000001", name: "Admin", sessionId: ID });
});

describe("pages admin", () => {
  it("creates through one audited RPC and returns a parsed DTO with UTC timestamps", async () => {
    const { client, rpc } = fakeClient({ rpc: ok({ ...pageRow, internal: "x" }) });
    const page = await createPage(client, { title: " Tentang ", slug: "tentang" });
    expect(requireAdmin).toHaveBeenCalledWith(client);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("create_page", { p_values: { title: "Tentang", slug: "tentang", content: "" } });
    expect(page).not.toHaveProperty("internal");
    expect(page.created_at).toBe("2026-10-15T03:00:00.123Z");
    expect(page.updated_at).toBe("2026-10-15T03:00:00.000Z");
  });

  it("rejects invalid input and status writes before calling the database", async () => {
    const { client, rpc } = fakeClient();
    const error = await rejectsWith(createPage(client, { title: "", slug: "Bad Slug" }), "VALIDATION_ERROR");
    expect(Object.keys(error.details.fieldErrors ?? {})).toEqual(expect.arrayContaining(["title", "slug"]));
    await rejectsWith(createPage(client, { title: "X", slug: "x", status: "PUBLISHED" }), "VALIDATION_ERROR");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("stops when the admin guard fails", async () => {
    requireAdmin.mockRejectedValueOnce(new AppError("FORBIDDEN"));
    const { client, rpc } = fakeClient();
    await rejectsWith(createPage(client, { title: "X", slug: "x" }), "FORBIDDEN");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("maps duplicate slug to CONFLICT and missing rows to NOT_FOUND", async () => {
    await rejectsWith(createPage(fakeClient({ rpc: fail("23505") }).client, { title: "X", slug: "x" }), "CONFLICT");
    await rejectsWith(updatePage(fakeClient({ rpc: fail("P0002") }).client, ID, { title: "X" }), "NOT_FOUND");
    await rejectsWith(archivePage(fakeClient({ rpc: fail("P0002") }).client, ID), "NOT_FOUND");
  });

  it("sends only the changed fields on update (no schema defaults overwrite content)", async () => {
    const { client, rpc } = fakeClient({ rpc: ok(pageRow) });
    await updatePage(client, ID, { title: "Baru" });
    expect(rpc).toHaveBeenCalledWith("update_page", { p_id: ID, p_changes: { title: "Baru" } });
  });

  it("treats a malformed id as NOT_FOUND without querying", async () => {
    const { client, rpc, from } = fakeClient();
    await rejectsWith(updatePage(client, "abc", { title: "X" }), "NOT_FOUND");
    await rejectsWith(getAdminPage(client, "abc"), "NOT_FOUND");
    expect(rpc).not.toHaveBeenCalled();
    expect(from).not.toHaveBeenCalled();
  });

  it("publishes with the existing audited RPC only, then reads the row", async () => {
    const { client, rpc } = fakeClient({ query: ok({ ...pageRow, status: "PUBLISHED" }) });
    const page = await publishPage(client, ID);
    expect(rpc.mock.calls).toEqual([["publish_page", { p_id: ID }]]);
    expect(page.status).toBe("PUBLISHED");
  });

  it("archives through archive_page", async () => {
    const { client, rpc } = fakeClient({ rpc: ok({ ...pageRow, status: "ARCHIVED" }) });
    expect((await archivePage(client, ID)).status).toBe("ARCHIVED");
    expect(rpc).toHaveBeenCalledWith("archive_page", { p_id: ID });
  });

  it("fails closed when the database returns an unexpected shape", async () => {
    await rejectsWith(createPage(fakeClient({ rpc: ok({ id: ID }) }).client, { title: "X", slug: "x" }), "SERVICE_UNAVAILABLE");
  });
});

describe("pages public", () => {
  it("returns NOT_FOUND (not 503) when the slug has no published row", async () => {
    const { client, calls } = fakeClient({ query: ok(null) });
    await rejectsWith(getPublicPageBySlug(client, "tentang"), "NOT_FOUND");
    expect(calls).toContainEqual(["eq", ["status", "PUBLISHED"]]);
    expect(calls).toContainEqual(["maybeSingle", []]);
  });

  it("rejects invalid slugs as NOT_FOUND without querying", async () => {
    const { client, from } = fakeClient();
    await rejectsWith(getPublicPageBySlug(client, "../x"), "NOT_FOUND");
    expect(from).not.toHaveBeenCalled();
  });

  it("paginates published pages with an explicit projection", async () => {
    const { client, calls } = fakeClient({ query: ok([{ ...pageRow, status: "PUBLISHED" }], 21) });
    const result = await listPublicPages(client, { page: "2" });
    expect(calls).toContainEqual(["range", [20, 39]]);
    expect(calls).toContainEqual(["eq", ["status", "PUBLISHED"]]);
    expect(result.pagination).toEqual({ page: 2, page_size: 20, total_items: 21, total_pages: 2 });
    expect(Object.keys(result.items[0]).sort()).toEqual(["content", "id", "meta_description", "meta_title", "published_at", "slug", "title"]);
    expect(requireAdmin).not.toHaveBeenCalled();
  });

  it("rejects page_size above 100", async () => {
    await rejectsWith(listPublicPages(fakeClient().client, { page_size: "500" }), "VALIDATION_ERROR");
  });
});

describe("programs", () => {
  it("creates via create_program with the shared programSchema", async () => {
    const { client, rpc } = fakeClient({ rpc: ok(programRow) });
    const program = await createProgram(client, { name: "Study Group", slug: "study-group", display_order: 2 });
    expect(rpc).toHaveBeenCalledWith("create_program", {
      p_values: { name: "Study Group", slug: "study-group", description: "", display_order: 2 },
    });
    expect(program.display_order).toBe(2);
  });

  it("does not inject description/display_order defaults on partial update", async () => {
    const { client, rpc } = fakeClient({ rpc: ok(programRow) });
    await updateProgram(client, ID, { name: "Baru" });
    expect(rpc).toHaveBeenCalledWith("update_program", { p_id: ID, p_changes: { name: "Baru" } });
  });

  it("lists published programs without status or timestamps", async () => {
    const { client, calls } = fakeClient({ query: ok([{ ...programRow, status: "PUBLISHED" }], 1) });
    const result = await listPublicPrograms(client, {});
    expect(calls).toContainEqual(["eq", ["status", "PUBLISHED"]]);
    expect(result.items[0]).not.toHaveProperty("status");
    expect(result.items[0]).not.toHaveProperty("created_at");
  });
});

describe("website settings", () => {
  it("reads public settings only through read_public_settings and the allowlisted DTO", async () => {
    const { client, rpc, from } = fakeClient({
      rpc: ok({ organization_name: "UVICS", registration_open: true, internal_note: "x", updated_by: ID }),
    });
    expect(await getPublicSettings(client)).toEqual({ organization_name: "UVICS", registration_open: true });
    expect(rpc).toHaveBeenCalledWith("read_public_settings");
    expect(from).not.toHaveBeenCalled();
  });

  it("validates writes with websiteSettingsSchema before the audited RPC", async () => {
    const { client, rpc } = fakeClient();
    for (const bad of [{}, { site_name: "x" }, { instagram_url: "javascript:alert(1)" }, { phone: "081234" }, { registration_open: "true" }])
      await rejectsWith(updateWebsiteSettings(client, bad), "VALIDATION_ERROR");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("writes valid settings in one RPC and returns parsed admin DTOs", async () => {
    const row = { key: "registration_open", value: true, updated_at: "2026-10-15T03:00:00+00:00", updated_by: ID };
    const { client, rpc } = fakeClient({ rpc: ok([row]) });
    const result = await updateWebsiteSettings(client, { registration_open: true });
    expect(requireAdmin).toHaveBeenCalled();
    expect(rpc.mock.calls).toEqual([["update_website_settings", { p_values: { registration_open: true } }]]);
    expect(result).toEqual([{ ...row, updated_at: "2026-10-15T03:00:00.000Z" }]);
  });

  it("guards the admin settings list", async () => {
    requireAdmin.mockRejectedValueOnce(new AppError("UNAUTHENTICATED"));
    const { client, from } = fakeClient();
    await rejectsWith(listAdminSettings(client), "UNAUTHENTICATED");
    expect(from).not.toHaveBeenCalled();
  });
});
