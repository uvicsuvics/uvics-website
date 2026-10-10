import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/backend/errors";
import {
  achievementSchema,
  competitionSchema,
  contentMemberSchema,
  listPublicAchievements,
  listPublicCompetitions,
  listPublicProjects,
  projectSchema,
} from "@/lib/backend/content";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];
const competitionRow: Pick<Tables["competitions"]["Row"], "status" | "publication_status"> = {
  status: "OPEN",
  publication_status: "DRAFT",
};
const achievementRow: Pick<Tables["achievements"]["Row"], "publication_status" | "certificate_file"> = {
  publication_status: "PUBLISHED",
  certificate_file: null,
};
const achievementMember: Pick<Tables["achievement_members"]["Row"], "member_id" | "member_name" | "role"> = {
  member_id: null,
  member_name: "Peserta Luar",
  role: null,
};
const projectRow: Pick<Tables["projects"]["Row"], "status" | "publication_status"> = {
  status: "ARCHIVED",
  publication_status: "PUBLISHED",
};
const projectMember: Pick<Tables["project_members"]["Insert"], "project_id" | "member_id"> = {
  project_id: "00000000-0000-4000-8000-000000000731",
  member_id: "00000000-0000-4000-8000-000000000701",
};
// @ts-expect-error lifecycle bukan teks bebas
const freeTextStatus: Tables["competitions"]["Row"]["status"] = "Open";
// @ts-expect-error boolean published diganti publication_status (D17)
const legacyPublished: Pick<Tables["achievements"]["Row"], "published"> = { published: true };

describe("database types mirror content_foundation migration", () => {
  it("exposes publication_status, lifecycle enums and member links", () => {
    expect([competitionRow, achievementRow, achievementMember, projectRow, projectMember, freeTextStatus, legacyPublished]).toHaveLength(7);
  });
});

function fakeClient(result: { data: unknown[] | null; error: { code?: string } | null; count: number | null }) {
  const calls: [string, unknown[]][] = [];
  const builder: Record<string, unknown> = {
    then: (resolve: (value: typeof result) => unknown) => resolve(result),
  };
  for (const method of ["from", "select", "eq", "ilike", "order", "range"])
    builder[method] = (...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    };
  return { client: builder as unknown as SupabaseClient<Database>, calls };
}
const empty = { data: [], error: null, count: 0 };

describe("content input validation", () => {
  const competition = { title: "Lomba", slug: "lomba", organizer: "Org" };

  it("defaults to DRAFT and lifecycle defaults", () => {
    const parsed = competitionSchema.parse(competition);
    expect([parsed.publication_status, parsed.status]).toEqual(["DRAFT", "UPCOMING"]);
    expect(projectSchema.parse({ title: "P", slug: "p", summary: "S" }).status).toBe("PLANNED");
  });

  it("enforces date order, real calendar dates and http(s) links", () => {
    expect(competitionSchema.safeParse({ ...competition, registration_deadline: "2026-10-20", competition_date: "2026-10-20" }).success).toBe(true);
    for (const bad of [
      { registration_deadline: "2026-10-21", competition_date: "2026-10-20" },
      { competition_date: "2026-02-30" },
      { registration_url: "javascript:alert(1)" },
      { status: "Open" },
    ])
      expect(competitionSchema.safeParse({ ...competition, ...bad }).success).toBe(false);
    expect(projectSchema.safeParse({ title: "P", slug: "p", summary: "S", start_date: "2026-02-01", end_date: "2026-01-01" }).success).toBe(false);
    expect(achievementSchema.safeParse({ title: "A", slug: "a", competition_name: "C", ranking: "1", achievement_date: "2026-01-01", published: true }).success).toBe(true);
    expect(achievementSchema.parse({ title: "A", slug: "a", competition_name: "C", ranking: "1", achievement_date: "2026-01-01" })).not.toHaveProperty("published");
  });

  it("requires member_id or member_name (D18)", () => {
    expect(contentMemberSchema.safeParse({ member_name: "Peserta Luar" }).success).toBe(true);
    expect(contentMemberSchema.safeParse({ member_id: "00000000-0000-4000-8000-000000000701" }).success).toBe(true);
    expect(contentMemberSchema.safeParse({ role: "Ketua" }).success).toBe(false);
  });
});

describe("public content queries", () => {
  it.each([
    ["competitions", listPublicCompetitions],
    ["achievements", listPublicAchievements],
    ["projects", listPublicProjects],
  ] as const)("%s always filters PUBLISHED and paginates", async (table, list) => {
    const { client, calls } = fakeClient({ data: [], error: null, count: 25 });
    const result = await list(client, { page: "2", page_size: "10" });
    expect(calls).toContainEqual(["from", [table]]);
    expect(calls).toContainEqual(["eq", ["publication_status", "PUBLISHED"]]);
    expect(calls).toContainEqual(["range", [10, 19]]);
    expect(result).toEqual({ items: [], pagination: { page: 2, page_size: 10, total_items: 25, total_pages: 3 } });
  });

  it("applies allowlisted filters and ignores an empty search", async () => {
    const { client, calls } = fakeClient(empty);
    await listPublicCompetitions(client, { search: "ui", status: "OPEN", level: "Nasional", category: "UI/UX" });
    expect(calls).toEqual(expect.arrayContaining([
      ["ilike", ["title", "%ui%"]],
      ["eq", ["status", "OPEN"]],
      ["eq", ["level", "Nasional"]],
      ["eq", ["category", "UI/UX"]],
    ]));
    const blank = fakeClient(empty);
    await listPublicProjects(blank.client, { search: "  " });
    expect(blank.calls.some(([method]) => method === "ilike")).toBe(false);
  });

  it("rejects invalid filters and pagination with VALIDATION_ERROR", async () => {
    for (const raw of [{ status: "DRAFT" }, { page_size: "101" }, { page: "0" }])
      await expect(listPublicCompetitions(fakeClient(empty).client, raw)).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("maps database failures without leaking provider errors", async () => {
    await expect(listPublicAchievements(fakeClient({ data: null, error: { code: "PGRST103" }, count: null }).client, { page: "99" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(listPublicProjects(fakeClient({ data: null, error: { code: "08006" }, count: null }).client, {})).rejects.toBeInstanceOf(AppError);
  });
});
