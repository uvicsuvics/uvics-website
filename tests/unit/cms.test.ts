import { describe, expect, it } from "vitest";
import { pageSchema, programSchema, websiteSettingsSchema } from "@/lib/backend/cms";
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

describe("cms input validation", () => {
  it("defaults pages and programs to DRAFT and rejects bad slugs", () => {
    expect(pageSchema.parse({ title: "Tentang", slug: "tentang" }).status).toBe("DRAFT");
    expect(programSchema.parse({ name: "Study Group", slug: "study-group" }).status).toBe("DRAFT");
    expect(pageSchema.safeParse({ title: "X", slug: "Bad Slug" }).success).toBe(false);
    expect(pageSchema.safeParse({ title: "X", slug: "x", status: "LIVE" }).success).toBe(false);
  });

  it("accepts only allowlisted settings with safe links, email and D04 phone", () => {
    expect(websiteSettingsSchema.safeParse({ email: "halo@example.invalid", phone: "+6281234567890", instagram_url: "https://instagram.com/uvics", registration_open: true, maintenance_mode: false }).success).toBe(true);
    for (const bad of [
      { instagram_url: "javascript:alert(1)" },
      { email: "bukan-email" },
      { phone: "081234567890" },
      { unknown_key: true },
    ])
      expect(websiteSettingsSchema.safeParse(bad).success).toBe(false);
  });
});
