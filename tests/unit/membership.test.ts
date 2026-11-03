import { describe, expect, it } from "vitest";
import {
  memberSchema,
  membershipHistorySchema,
  photoSchema,
  registrationSchema,
} from "@/lib/backend/membership";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];
const registrationRow: Pick<Tables["registrations"]["Row"], "converted_member_id" | "status" | "phone"> = {
  converted_member_id: null,
  status: "SUBMITTED",
  phone: "+628123456789",
};
const memberRow: Pick<Tables["members"]["Row"], "full_name" | "public_profile" | "deleted_at"> = {
  full_name: "Test Member",
  public_profile: false,
  deleted_at: null,
};
const historyRow: Pick<Tables["membership_histories"]["Row"], "start_date" | "end_date" | "notes"> = {
  start_date: null,
  end_date: null,
  notes: null,
};

const registration = {
  id: "00000000-0000-4000-8000-000000000001",
  full_name: "Test Applicant",
  nim: "105021810011",
  email: "applicant@student.unklab.ac.id",
  phone: "+628123456789",
  faculty: "FIK",
  study_program: "Informatika",
  batch: 2023,
  submitted_at: "2026-10-10T00:00:00Z",
  created_at: "2026-10-10T00:00:00Z",
  updated_at: "2026-10-10T00:00:00Z",
};

describe("membership row schemas (D04 stored phone)", () => {
  it("accepts normalized +country phone", () => {
    expect(registrationSchema.safeParse(registration).success).toBe(true);
  });

  it("accepts timestamptz as PostgREST returns it (offset, microseconds)", () => {
    const row = { ...registration, submitted_at: "2026-10-10T08:00:00.123456+00:00" };
    expect(registrationSchema.safeParse(row).success).toBe(true);
  });

  it("accepts a member row with only full_name, matching nullable SQL columns", () => {
    const member = {
      id: registration.id,
      full_name: "Historical Member",
      nim: null,
      email: null,
      phone: null,
      faculty: null,
      study_program: null,
      status: "ACTIVE",
      public_profile: true,
      created_at: "2026-10-10T08:00:00+00:00",
      updated_at: "2026-10-10T08:00:00+00:00",
    };
    expect(memberSchema.safeParse(member).success).toBe(true);
  });

  it.each(["08123456789", "+62 812-3456-789", "+0123456789", "+62123"])(
    "rejects unnormalized phone %s",
    (phone) => {
      expect(registrationSchema.safeParse({ ...registration, phone }).success).toBe(false);
      expect(memberSchema.shape.phone.safeParse(phone).success).toBe(false);
    },
  );
});

describe("membership validations (Issue #54)", () => {
  describe("photoSchema", () => {
    it("accepts media reference key, null, and undefined", () => {
      expect(photoSchema.safeParse(null).success).toBe(true);
      expect(photoSchema.safeParse(undefined).success).toBe(true);
      expect(photoSchema.safeParse("uvics/members/photo-123.jpg").success).toBe(true);
    });

    it("rejects external HTTP/HTTPS URLs", () => {
      expect(photoSchema.safeParse("https://example.com/photo.jpg").success).toBe(false);
      expect(photoSchema.safeParse("http://example.com/photo.jpg").success).toBe(false);
    });

    it("rejects strings exceeding 500 characters", () => {
      const longRef = "a".repeat(501);
      expect(photoSchema.safeParse(longRef).success).toBe(false);
    });
  });

  describe("membershipHistorySchema", () => {
    const validHistory = {
      id: "00000000-0000-4000-8000-000000000001",
      member_id: "00000000-0000-4000-8000-000000000002",
      organization_period_id: "00000000-0000-4000-8000-000000000003",
      department_id: null,
      position_id: "00000000-0000-4000-8000-000000000004",
      start_date: "2024-08-01",
      end_date: "2025-07-31",
      notes: "Active contributor",
      created_at: "2026-10-10T00:00:00Z",
      updated_at: "2026-10-10T00:00:00Z",
    };

    it("accepts valid date range or null dates", () => {
      expect(membershipHistorySchema.safeParse(validHistory).success).toBe(true);
      expect(
        membershipHistorySchema.safeParse({ ...validHistory, start_date: null, end_date: null }).success,
      ).toBe(true);
      expect(
        membershipHistorySchema.safeParse({ ...validHistory, start_date: "2024-08-01", end_date: "2024-08-01" }).success,
      ).toBe(true);
    });

    it("rejects when end_date is before start_date", () => {
      const invalid = membershipHistorySchema.safeParse({
        ...validHistory,
        start_date: "2025-08-01",
        end_date: "2024-08-01",
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.issues[0]?.path).toEqual(["end_date"]);
      }
    });
  });
});

describe("database types mirror membership migration", () => {
  it("exposes registrations, member and history columns", () => {
    expect([registrationRow, memberRow, historyRow]).toHaveLength(3);
  });
});
