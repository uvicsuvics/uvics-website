import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  acceptRegistration,
  convertRegistrationInputSchema,
  convertRegistrationToMember,
  getAdminRegistrationById,
  listAdminRegistrations,
  registrationFilterSchema,
  rejectRegistration,
  reviewRegistration,
  reviewRegistrationInputSchema,
} from "@/lib/backend/registration-review";
import * as registrationReview from "@/lib/backend/registration-review";
import { registrationStatusSchema } from "@/lib/backend/membership";
import type { Database } from "@/types/database";

function fakeClient(result: {
  data: unknown;
  error: { code?: string } | null;
  count: number | null;
}) {
  const calls: [string, unknown[]][] = [];
  const builder: Record<string, unknown> = {
    then: (resolve: (value: typeof result) => unknown) => resolve(result),
  };
  for (const method of [
    "from",
    "select",
    "eq",
    "ilike",
    "or",
    "order",
    "range",
    "maybeSingle",
    "rpc",
  ]) {
    builder[method] = (...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    };
  }
  return { client: builder as unknown as SupabaseClient<Database>, calls };
}

describe("registration schemas validation", () => {
  it("validates allowed registration statuses (Scope 2)", () => {
    for (const valid of ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED"]) {
      expect(registrationStatusSchema.safeParse(valid).success).toBe(true);
    }
    for (const invalid of ["PENDING", "APPROVED", "DRAFT", "active", ""]) {
      expect(registrationStatusSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it("does not export an unused list input schema", () => {
    expect("registrationListInputSchema" in registrationReview).toBe(false);
  });

  it("filters empty strings and normalizes search in filter schema", () => {
    const emptyResult = registrationFilterSchema.parse({
      status: "",
      search: "",
    });
    expect(emptyResult.status).toBeUndefined();
    expect(emptyResult.search).toBeUndefined();

    const searchResult = registrationFilterSchema.parse({
      search: "  John%_ Doe  ",
      status: "ACCEPTED",
    });
    expect(searchResult.status).toBe("ACCEPTED");
    expect(searchResult.search).toBe("John Doe");

    // Input kurang dari 2 karakter ditolak
    expect(
      registrationFilterSchema.safeParse({ search: "a" }).success,
    ).toBe(false);

    // Karakter khusus yang ternormalisasi menjadi kosong dianggap tanpa filter (BACKEND_CONVENTIONS)
    expect(
      registrationFilterSchema.parse({ search: "%_" }).search,
    ).toBeUndefined();
  });

  it("validates review input schema (Scope 2, 3)", () => {
    const valid = {
      registration_id: "00000000-0000-4000-8000-000000000001",
      status: "ACCEPTED",
      admin_notes: "Memenuhi semua persyaratan wawancara",
    };
    expect(reviewRegistrationInputSchema.safeParse(valid).success).toBe(true);

    // Notes opsional; string kosong berarti hapus catatan
    expect(
      reviewRegistrationInputSchema.safeParse({
        registration_id: valid.registration_id,
        status: "REJECTED",
      }).success,
    ).toBe(true);
    expect(
      reviewRegistrationInputSchema.parse({ ...valid, admin_notes: "   " })
        .admin_notes,
    ).toBe("");

    // Non-UUID ditolak
    expect(
      reviewRegistrationInputSchema.safeParse({
        ...valid,
        registration_id: "not-a-uuid",
      }).success,
    ).toBe(false);

    // Notes > 2000 karakter ditolak
    expect(
      reviewRegistrationInputSchema.safeParse({
        ...valid,
        admin_notes: "a".repeat(2001),
      }).success,
    ).toBe(false);
  });

  it("validates convert input schema with nullable department for core leaders (Scope 5, U01)", () => {
    const base = {
      registration_id: "00000000-0000-4000-8000-000000000001",
      organization_period_id: "00000000-0000-4000-8000-000000000002",
      department_id: "00000000-0000-4000-8000-000000000003",
      position_id: "00000000-0000-4000-8000-000000000004",
      start_date: "2026-08-01",
    };
    expect(convertRegistrationInputSchema.safeParse(base).success).toBe(true);

    // department_id null diterima (pengurus inti tanpa departemen - U01)
    expect(
      convertRegistrationInputSchema.safeParse({
        ...base,
        department_id: null,
      }).success,
    ).toBe(true);

    // Format tanggal tidak valid (bukan YYYY-MM-DD) ditolak
    expect(
      convertRegistrationInputSchema.safeParse({
        ...base,
        start_date: "01-08-2026",
      }).success,
    ).toBe(false);
  });
});

describe("admin registration queries", () => {
  it("listAdminRegistrations applies status and search filters with pagination", async () => {
    const { client, calls } = fakeClient({ data: [], error: null, count: 42 });
    const result = await listAdminRegistrations(client, {
      page: "2",
      page_size: "10",
      status: "UNDER_REVIEW",
      search: "Andi",
    });

    expect(calls).toContainEqual(["from", ["registrations"]]);
    // Proyeksi listing kontrak #31: tanpa kontak, jawaban, atau catatan admin
    expect(calls).toContainEqual([
      "select",
      [
        "id,full_name,nim,study_program,batch,preferred_department_id,status,submitted_at",
        { count: "exact" },
      ],
    ]);
    expect(calls).toContainEqual(["eq", ["status", "UNDER_REVIEW"]]);
    expect(calls).toContainEqual([
      "or",
      ["full_name.ilike.%Andi%,nim.ilike.%Andi%"],
    ]);
    expect(calls).toContainEqual(["range", [10, 19]]);
    expect(result.pagination).toEqual({
      page: 2,
      page_size: 10,
      total_items: 42,
      total_pages: 5,
    });
  });

  it("listAdminRegistrations throws VALIDATION_ERROR on invalid pagination or status", async () => {
    const { client } = fakeClient({ data: [], error: null, count: 0 });
    await expect(
      listAdminRegistrations(client, { page: "0" }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await expect(
      listAdminRegistrations(client, { status: "INVALID_STATUS" }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("getAdminRegistrationById fetches registration detail by ID", async () => {
    const mockDetail = {
      id: "00000000-0000-4000-8000-000000000001",
      full_name: "Calon Anggota",
      nim: "10502181001",
      email: "calon@student.unklab.ac.id",
      status: "SUBMITTED",
    };
    const { client, calls } = fakeClient({
      data: mockDetail,
      error: null,
      count: 1,
    });
    const result = await getAdminRegistrationById(client, mockDetail.id);

    expect(calls).toContainEqual(["from", ["registrations"]]);
    expect(calls).toContainEqual(["eq", ["id", mockDetail.id]]);
    expect(calls).toContainEqual(["maybeSingle", []]);
    const [, [fields]] = calls.find(([method]) => method === "select")!;
    expect(String(fields).split(",")).toEqual(
      expect.arrayContaining(["email", "phone", "admin_notes", "consent_at"]),
    );
    expect(result).toEqual(mockDetail);
  });

  it("getAdminRegistrationById throws NOT_FOUND for non-existent row or non-UUID ID", async () => {
    const { client: clientNotFound } = fakeClient({
      data: null,
      error: null,
      count: 0,
    });
    await expect(
      getAdminRegistrationById(
        clientNotFound,
        "00000000-0000-4000-8000-000000000099",
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    const { client: clientInvalidId } = fakeClient({
      data: null,
      error: null,
      count: 0,
    });
    await expect(
      getAdminRegistrationById(clientInvalidId, "invalid-uuid"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("admin registration mutations", () => {
  const regId = "00000000-0000-4000-8000-000000000001";

  it("reviewRegistration calls admin_review_registration RPC", async () => {
    const { client, calls } = fakeClient({
      data: { id: regId, status: "UNDER_REVIEW" },
      error: null,
      count: null,
    });

    const result = await reviewRegistration(client, {
      registration_id: regId,
      status: "UNDER_REVIEW",
      admin_notes: "Berkas lengkap",
    });

    expect(calls).toContainEqual([
      "rpc",
      [
        "admin_review_registration",
        {
          p_registration_id: regId,
          p_status: "UNDER_REVIEW",
          p_admin_notes: "Berkas lengkap",
        },
      ],
    ]);
    expect(result).toEqual({ id: regId, status: "UNDER_REVIEW" });
  });

  it("reviewRegistration omits admin notes when not provided so the RPC keeps them", async () => {
    const { client, calls } = fakeClient({
      data: { id: regId, status: "UNDER_REVIEW" },
      error: null,
      count: null,
    });

    await reviewRegistration(client, { registration_id: regId, status: "UNDER_REVIEW" });

    const [, [, args]] = calls.find(([method]) => method === "rpc")!;
    expect(args).toEqual({ p_registration_id: regId, p_status: "UNDER_REVIEW" });
    expect(args).not.toHaveProperty("p_admin_notes", null);
  });

  it("acceptRegistration helper sets status ACCEPTED", async () => {
    const { client, calls } = fakeClient({
      data: { id: regId, status: "ACCEPTED" },
      error: null,
      count: null,
    });

    const result = await acceptRegistration(client, regId, "Lulus wawancara");
    expect(calls).toContainEqual([
      "rpc",
      [
        "admin_review_registration",
        {
          p_registration_id: regId,
          p_status: "ACCEPTED",
          p_admin_notes: "Lulus wawancara",
        },
      ],
    ]);
    expect(result.status).toBe("ACCEPTED");
  });

  it("rejectRegistration helper sets status REJECTED", async () => {
    const { client, calls } = fakeClient({
      data: { id: regId, status: "REJECTED" },
      error: null,
      count: null,
    });

    const result = await rejectRegistration(client, regId, "Tidak hadir");
    expect(calls).toContainEqual([
      "rpc",
      [
        "admin_review_registration",
        {
          p_registration_id: regId,
          p_status: "REJECTED",
          p_admin_notes: "Tidak hadir",
        },
      ],
    ]);
    expect(result.status).toBe("REJECTED");
  });

  it("convertRegistrationToMember calls admin_convert_registration_to_member RPC", async () => {
    const conversionResult = {
      member_id: "00000000-0000-4000-8000-000000000010",
      membership_history_id: "00000000-0000-4000-8000-000000000020",
      registration_id: regId,
    };
    const { client, calls } = fakeClient({
      data: conversionResult,
      error: null,
      count: null,
    });

    const payload = {
      registration_id: regId,
      organization_period_id: "00000000-0000-4000-8000-000000000002",
      department_id: null,
      position_id: "00000000-0000-4000-8000-000000000004",
      start_date: "2026-08-15",
    };

    const result = await convertRegistrationToMember(client, payload);
    expect(calls).toContainEqual([
      "rpc",
      [
        "admin_convert_registration_to_member",
        {
          p_registration_id: regId,
          p_organization_period_id: payload.organization_period_id,
          p_position_id: payload.position_id,
          p_start_date: "2026-08-15",
        },
      ],
    ]);
    // Departemen null tidak dikirim; RPC memakai default null (U01)
    const [, [, args]] = calls.find(([method]) => method === "rpc")!;
    expect(args).not.toHaveProperty("p_department_id", null);
    expect(result).toEqual(conversionResult);
  });

  it("maps RPC errors (P0001 -> CONFLICT, P0002 -> NOT_FOUND, 42501 -> FORBIDDEN)", async () => {
    const { client: conflictClient } = fakeClient({
      data: null,
      error: { code: "P0001" },
      count: null,
    });
    await expect(
      acceptRegistration(conflictClient, regId),
    ).rejects.toMatchObject({ code: "CONFLICT" });

    const { client: notFoundClient } = fakeClient({
      data: null,
      error: { code: "P0002" },
      count: null,
    });
    await expect(
      convertRegistrationToMember(notFoundClient, {
        registration_id: regId,
        organization_period_id: regId,
        department_id: null,
        position_id: regId,
        start_date: "2026-08-15",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    const { client: forbiddenClient } = fakeClient({
      data: null,
      error: { code: "42501" },
      count: null,
    });
    await expect(
      acceptRegistration(forbiddenClient, regId),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
