import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  PHONE_MAX_DIGITS,
  PHONE_MIN_DIGITS,
  datetimeSchema,
  httpUrlSchema,
  phoneSchema,
} from "@/lib/backend/validation";
import { websiteSettingsSchema } from "@/lib/backend/cms";
import { competitionSchema } from "@/lib/backend/content";
import { toPublicMember, toPublicSettings } from "@/lib/backend/dto";
import { memberSchema, registrationSchema } from "@/lib/backend/membership";
import { AppError } from "@/lib/backend/errors";

const SENTINEL = "private-sentinel";

describe("shared validation", () => {
  it("normalizes Indonesian 08 numbers and requires explicit country codes", () => {
    expect(phoneSchema.parse(" 0812-3456 7890 ")).toBe("+6281234567890");
    expect(phoneSchema.parse("+62 812-3456-7890")).toBe("+6281234567890");
    expect(phoneSchema.parse("+1 415 555 0100")).toBe("+14155550100");
    for (const value of [
      "812345678",
      "0212345678",
      "+0812345678",
      "+62812345678x12",
      "+62 (812) 345678",
      "08abc12345",
      "",
    ])
      expect(phoneSchema.safeParse(value).success).toBe(false);
  });
  it("counts phone length as digits after normalization without the plus sign", () => {
    const digits = (n: number) => "+1" + "2".repeat(n - 1);
    expect(phoneSchema.safeParse(digits(PHONE_MIN_DIGITS)).success).toBe(true);
    expect(phoneSchema.safeParse(digits(PHONE_MIN_DIGITS - 1)).success).toBe(
      false,
    );
    expect(phoneSchema.safeParse(digits(PHONE_MAX_DIGITS)).success).toBe(true);
    expect(phoneSchema.safeParse(digits(PHONE_MAX_DIGITS + 1)).success).toBe(
      false,
    );
    // "08" + 12 digit menjadi "+62" + "8" + 12 digit = 15 digit.
    expect(phoneSchema.safeParse("08" + "1".repeat(12)).success).toBe(true);
    expect(phoneSchema.safeParse("08" + "1".repeat(13)).success).toBe(false);
  });
  it("rejects unsafe URLs, invalid calendar dates, and offset-less datetimes", () => {
    expect(httpUrlSchema.safeParse("https://uvics.example/a").success).toBe(
      true,
    );
    for (const value of [
      "javascript:alert(1)",
      "ftp://uvics.example",
      "https://user:pass@uvics.example",
      "//uvics.example",
    ])
      expect(httpUrlSchema.safeParse(value).success).toBe(false);
    expect(z.iso.date().safeParse("2024-02-29").success).toBe(true);
    for (const value of ["2026-02-29", "2026-04-31", "2026-1-01"])
      expect(z.iso.date().safeParse(value).success).toBe(false);
    expect(datetimeSchema.parse("2026-10-08T08:00:00+08:00")).toBe(
      "2026-10-08T00:00:00.000Z",
    );
    expect(datetimeSchema.safeParse("2026-10-08T08:00:00").success).toBe(false);
    expect(z.uuid().safeParse("1").success).toBe(false);
  });
});

describe("explicit DTO projections", () => {
  it("projects public member fields only and drops non-public photos", () => {
    const row = {
      id: "00000000-0000-4000-8000-000000000001",
      full_name: "Synthetic Member",
      position_name: "Ketua",
      department_name: "Software",
      nim: SENTINEL,
      email: SENTINEL,
      phone: SENTINEL,
      admin_notes: SENTINEL,
      public_profile: true,
      photo: {
        cloud_name: "synthetic",
        public_id: "uvics/pending/00000000-0000-4000-8000-000000000002",
        version: 1,
        format: "png",
        access: "PRIVATE",
      },
    };
    const dto = toPublicMember(row);
    expect(dto).toEqual({
      name: "Synthetic Member",
      photo: null,
      position: "Ketua",
      department: "Software",
    });
    expect(JSON.stringify(dto)).not.toContain(SENTINEL);
    expect(() => toPublicMember({ nim: SENTINEL })).toThrow(AppError);
  });
  it("keeps allowlisted, well-typed settings and drops unknown or malformed values", () => {
    const settings = toPublicSettings({
      organization_name: "UVICS",
      registration_open: "true",
      maintenance_mode: false,
      instagram_url: "javascript:alert(1)",
      phone: "0812 3456 7890",
      internal_note: SENTINEL,
      updated_by: SENTINEL,
    });
    expect(settings).toEqual({
      organization_name: "UVICS",
      maintenance_mode: false,
      phone: "+6281234567890",
    });
    expect(settings.registration_open === true).toBe(false);
    const published =
      "https://res.cloudinary.com/synthetic/image/upload/c_limit,w_256/v1/uvics/published/00000000-0000-4000-8000-000000000004.png";
    expect(
      toPublicSettings({ logo: published, favicon: "/favicon.ico" }),
    ).toEqual({ logo: published, favicon: "/favicon.ico" });
    for (const asset of [
      "javascript:alert(1)",
      "/../secret.png",
      "https://res.cloudinary.com/synthetic/image/authenticated/v1/uvics/pending/00000000-0000-4000-8000-000000000004.png",
      "https://res.cloudinary.com/synthetic/image/upload/v1/uvics/pending/00000000-0000-4000-8000-000000000004.png",
      "https://evil.example/logo.png",
    ])
      expect(toPublicSettings({ logo: asset, favicon: asset })).toEqual({});
    // Pasangan fixture tests/db/security.sql: SQL subset konservatif dari DTO.
    expect(
      toPublicSettings({
        youtube_url: "https://example.org/path?x=1#y",
        email: "a.b@uvics.example",
        organization_name: "UVICS Unklab",
      }),
    ).toEqual({
      youtube_url: "https://example.org/path?x=1#y",
      email: "a.b@uvics.example",
      organization_name: "UVICS Unklab",
    });
    expect(
      toPublicSettings({
        youtube_url: "https://example.org:99999/path",
        email: "a..b@uvics.example",
        organization_name: "\t",
      }),
    ).toEqual({});
    expect(
      toPublicSettings({ youtube_url: "https://ab--c.example/x" }),
    ).toEqual({ youtube_url: "https://ab--c.example/x" });
    for (const url of ["https://xn--a.example/x", "https://XN--0.example/x"])
      expect(toPublicSettings({ youtube_url: url })).toEqual({});
    expect(() => toPublicSettings(null)).toThrow(AppError);
  });
});

describe("domain URL fields reuse the shared HTTP/S convention", () => {
  const fields = {
    "settings.instagram_url": websiteSettingsSchema.shape.instagram_url,
    "competition.registration_url": competitionSchema.shape.registration_url,
    "member.linkedin_url": memberSchema.shape.linkedin_url,
    "member.github_url": memberSchema.shape.github_url,
    "member.instagram_url": memberSchema.shape.instagram_url,
    "registration.portfolio_url": registrationSchema.shape.portfolio_url,
  };

  it.each(Object.entries(fields))("%s", (_, schema) => {
    expect(schema.safeParse("https://uvics.example/a").success).toBe(true);
    for (const value of [
      "javascript:alert(1)",
      "data:text/html,x",
      "https://user:pass@uvics.example/a",
    ]) {
      expect(schema.safeParse(value).success).toBe(false);
    }
  });
});
