import { describe, expect, it } from "vitest";
import { pageSchema, adminPageDto, publicPageDto } from "@/lib/backend/pages";
import { programSchema, publicProgramDto } from "@/lib/backend/programs";
import { PUBLIC_SETTINGS_KEYS } from "@/lib/backend/settings";

describe("CMS Runtime Boundaries", () => {
  describe("Pages Validation", () => {
    it("validates page slug and requirements", () => {
      expect(pageSchema.safeParse({ title: "Valid Title", slug: "valid-slug", content: "Content" }).success).toBe(true);
      
      // Invalid slug
      expect(pageSchema.safeParse({ title: "Valid", slug: "Invalid Slug!", content: "" }).success).toBe(false);
      expect(pageSchema.safeParse({ title: "Valid", slug: "valid-slug", content: "" }).success).toBe(true);
    });

    it("public page projection redacts sensitive fields", () => {
      const fullAdminRow = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Test",
        slug: "test",
        content: "Hello",
        meta_title: null,
        meta_description: null,
        status: "PUBLISHED" as const,
        published_at: "2026-10-10T00:00:00Z",
        created_at: "2026-10-09T00:00:00Z",
        updated_at: "2026-10-09T00:00:00Z",
      };
      
      expect(adminPageDto.parse(fullAdminRow)).toEqual(fullAdminRow);
      
      const publicRow = publicPageDto.parse(fullAdminRow);
      expect(publicRow).not.toHaveProperty("status");
      expect(publicRow).not.toHaveProperty("created_at");
      expect(publicRow).not.toHaveProperty("updated_at");
      expect(publicRow).toHaveProperty("slug", "test");
    });
  });

  describe("Programs Validation", () => {
    it("validates program schemas", () => {
      expect(programSchema.safeParse({ name: "Prog", slug: "prog", description: "Desc", display_order: 1 }).success).toBe(true);
      expect(programSchema.safeParse({ name: "", slug: "prog", description: "Desc" }).success).toBe(false); // Name too short
    });

    it("public program projection redacts sensitive fields", () => {
      const fullAdminRow = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Prog",
        slug: "test-prog",
        short_description: null,
        description: "Desc",
        image: null,
        status: "DRAFT" as const,
        display_order: 0,
        created_at: "2026-10-09T00:00:00Z",
        updated_at: "2026-10-09T00:00:00Z",
      };

      const publicRow = publicProgramDto.parse(fullAdminRow);
      expect(publicRow).not.toHaveProperty("status");
      expect(publicRow).not.toHaveProperty("created_at");
      expect(publicRow).not.toHaveProperty("updated_at");
    });
  });

  describe("Website Settings Access", () => {
    it("restricts public access to allowlisted keys", () => {
      expect(PUBLIC_SETTINGS_KEYS).toContain("site_name");
      expect(PUBLIC_SETTINGS_KEYS).toContain("social_links");
      // Intentionally not containing a made-up sensitive key
      expect((PUBLIC_SETTINGS_KEYS as readonly string[]).includes("stripe_secret")).toBe(false);
    });
  });
});
