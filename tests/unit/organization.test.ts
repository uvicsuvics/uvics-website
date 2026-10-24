import { describe, expect, it } from "vitest";
import {
  departmentSchema,
  organizationPeriodSchema,
  positionSchema,
} from "@/lib/backend/organization";
import * as organizationModule from "@/lib/backend/organization";

describe("Organization domain schemas", () => {
  it("only exports organization entities and not membership entities", () => {
    expect(Object.keys(organizationModule).sort()).toEqual(
      [
        "departmentSchema",
        "organizationPeriodSchema",
        "positionSchema",
      ].sort(),
    );
    expect("memberSchema" in organizationModule).toBe(false);
    expect("membershipHistorySchema" in organizationModule).toBe(false);
  });

  describe("departmentSchema", () => {
    const validDepartment = {
      id: "00000000-0000-4000-8000-000000000101",
      name: "Software Engineering",
      slug: "software-engineering",
      description: "Handles engineering",
      display_order: 1,
      active: true,
      created_at: "2026-09-22T00:00:00.000Z",
      updated_at: "2026-09-22T00:00:00.000Z",
    };

    it("parses valid department", () => {
      const res = departmentSchema.safeParse(validDepartment);
      expect(res.success).toBe(true);
    });

    it("enforces lowercase kebab-case for slug", () => {
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "Software Engineering" }).success,
      ).toBe(false);
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "software_engineering" }).success,
      ).toBe(false);
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "software--engineering" }).success,
      ).toBe(false);
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "-software-engineering" }).success,
      ).toBe(false);
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "software-engineering-" }).success,
      ).toBe(false);
      expect(
        departmentSchema.safeParse({ ...validDepartment, slug: "software-eng-123" }).success,
      ).toBe(true);
    });
  });

  describe("positionSchema", () => {
    const validPosition = {
      id: "00000000-0000-4000-8000-000000000201",
      name: "President",
      description: "Organization President",
      level: "Executive",
      display_order: 1,
      active: true,
      created_at: "2026-09-22T00:00:00.000Z",
      updated_at: "2026-09-22T00:00:00.000Z",
    };

    it("parses valid position", () => {
      const res = positionSchema.safeParse(validPosition);
      expect(res.success).toBe(true);
    });

    it("rejects invalid level or name lengths", () => {
      expect(positionSchema.safeParse({ ...validPosition, name: "" }).success).toBe(false);
      expect(positionSchema.safeParse({ ...validPosition, level: "" }).success).toBe(false);
    });
  });

  describe("organizationPeriodSchema", () => {
    const validPeriod = {
      id: "00000000-0000-4000-8000-000000000301",
      name: "2024/2025",
      start_date: "2024-08-01",
      end_date: "2025-07-31",
      status: "ENDED" as const,
      created_at: "2026-09-22T00:00:00.000Z",
      updated_at: "2026-09-22T00:00:00.000Z",
    };

    it("parses valid organization period", () => {
      const res = organizationPeriodSchema.safeParse(validPeriod);
      expect(res.success).toBe(true);
    });

    it("validates strict YYYY-MM-DD calendar dates", () => {
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, start_date: "2024/08/01" }).success,
      ).toBe(false);
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, start_date: "01-08-2024" }).success,
      ).toBe(false);
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, start_date: "2024-02-30" }).success,
      ).toBe(false);
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, end_date: "not-a-date" }).success,
      ).toBe(false);
    });

    it("enforces start_date <= end_date", () => {
      const sameDay = organizationPeriodSchema.safeParse({
        ...validPeriod,
        start_date: "2024-08-01",
        end_date: "2024-08-01",
      });
      expect(sameDay.success).toBe(true);

      const invalidRange = organizationPeriodSchema.safeParse({
        ...validPeriod,
        start_date: "2025-08-01",
        end_date: "2024-08-01",
      });
      expect(invalidRange.success).toBe(false);
      if (!invalidRange.success) {
        expect(invalidRange.error.issues[0]?.path).toEqual(["end_date"]);
      }
    });

    it("only permits UPCOMING, ACTIVE, ENDED statuses", () => {
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, status: "UPCOMING" }).success,
      ).toBe(true);
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, status: "ACTIVE" }).success,
      ).toBe(true);
      expect(
        organizationPeriodSchema.safeParse({ ...validPeriod, status: "ENDED" }).success,
      ).toBe(true);
      expect(
        organizationPeriodSchema.safeParse({
          ...validPeriod,
          status: "ARCHIVED" as unknown as "UPCOMING",
        }).success,
      ).toBe(false);
    });
  });
});
