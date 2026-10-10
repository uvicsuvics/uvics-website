import { describe, expect, it } from "vitest";
import type { Database } from "@/types/database";

type Public = Database["public"];
const pageRow: Pick<Public["Tables"]["pages"]["Row"], "status" | "published_at"> = { status: "PUBLISHED", published_at: null };
const programRow: Pick<Public["Tables"]["programs"]["Row"], "status" | "display_order"> = { status: "DRAFT", display_order: 0 };
const settingRow: Pick<Public["Tables"]["website_settings"]["Row"], "key" | "value" | "updated_by"> = {
  key: "organization_name",
  value: "UVICS",
  updated_by: null,
};
const publishArgs: Public["Functions"]["publish_page"]["Args"] = { p_id: "00000000-0000-4000-8000-000000000801" };

describe("database types mirror cms_foundation migration", () => {
  it("exposes pages, programs, settings and publish RPCs", () => {
    expect([pageRow, programRow, settingRow, publishArgs]).toHaveLength(4);
  });
});
