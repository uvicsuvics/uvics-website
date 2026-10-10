import { describe, expect, it } from "vitest";
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
