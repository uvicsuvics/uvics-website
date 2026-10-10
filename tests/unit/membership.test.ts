import { describe, expect, it } from "vitest";
import { memberSchema, registrationSchema } from "@/lib/backend/membership";

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

  it.each(["08123456789", "+62 812-3456-789", "+0123456789", "+62123"])(
    "rejects unnormalized phone %s",
    (phone) => {
      expect(registrationSchema.safeParse({ ...registration, phone }).success).toBe(false);
      expect(memberSchema.shape.phone.safeParse(phone).success).toBe(false);
    },
  );
});
