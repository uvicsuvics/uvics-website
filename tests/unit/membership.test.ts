import { describe, expect, it } from "vitest";
import { memberSchema, registrationSchema } from "@/lib/backend/membership";
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

describe("database types mirror membership migration", () => {
  it("exposes registrations, member and history columns", () => {
    expect([registrationRow, memberRow, historyRow]).toHaveLength(3);
  });
});
