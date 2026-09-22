import { describe, expect, it } from "vitest";
import {
  loginSchema,
  paginationSchema,
  slugSchema,
} from "@/lib/backend/validation";
import { assertOrigin, trustedIp } from "@/lib/backend/request";
import { AppError, toFailure, httpFailure } from "@/lib/backend/errors";
import { mediaPolicy, validateProviderAsset } from "@/lib/media/policy";

describe("untrusted boundaries", () => {
  it("normalizes email but preserves password bytes", () => {
    expect(
      loginSchema.parse({
        email: " ADMIN@example.COM ",
        password: " p a s s ",
      }),
    ).toEqual({ email: "admin@example.com", password: " p a s s " });
    expect(loginSchema.safeParse({ email: "bad", password: "" }).success).toBe(
      false,
    );
  });
  it("rejects unlimited/fractional/invalid pagination instead of clamping", () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, page_size: 20 });
    for (const input of [
      { page: 0 },
      { page: "1.2" },
      { page_size: 101 },
      { page_size: "" },
      { page: Infinity },
    ])
      expect(paginationSchema.safeParse(input).success).toBe(false);
    expect(paginationSchema.parse({ page: "2", page_size: "100" })).toEqual({
      page: 2,
      page_size: 100,
    });
    expect(slugSchema.safeParse("../Admin").success).toBe(false);
  });
  it("requires the configured exact origin and cannot trust arbitrary forwarded IPs", () => {
    for (const origin of [
      null,
      "null",
      "https://evil.example",
      "https://sub.uvics.test",
      "https://uvics.test.evil",
    ])
      expect(() => assertOrigin(origin, "https://uvics.test")).toThrow(
        AppError,
      );
    expect(() =>
      assertOrigin("https://uvics.test", "https://uvics.test"),
    ).not.toThrow();
    const h = new Headers({
      "x-forwarded-for": "1.2.3.4",
      "x-real-ip": "1.2.3.4",
    });
    expect(trustedIp(h, "http://localhost:3000", false)).toBe("local");
    expect(() => trustedIp(h, "https://uvics.test", false)).toThrow(AppError);
    h.set("x-vercel-forwarded-for", "203.0.113.5");
    expect(trustedIp(h, "https://uvics.test", true)).toBe("203.0.113.5");
    h.set("x-vercel-forwarded-for", "203.0.113.5, 1.2.3.4");
    expect(() => trustedIp(h, "https://uvics.test", true)).toThrow(AppError);
  });
  it("redacts unknown errors and distinguishes outage from quota", async () => {
    expect(
      JSON.stringify(toFailure(new Error("secret SQL password"))),
    ).not.toContain("secret");
    expect(httpFailure(new AppError("SERVICE_UNAVAILABLE")).status).toBe(503);
    const response = httpFailure(
      new AppError("RATE_LIMITED", { retryAfter: 45 }),
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("45");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
});

describe("provider metadata is authoritative", () => {
  const expected = {
    publicId: "uvics/pending/abc",
    assetId: "asset",
    version: 123,
  };
  const image = {
    public_id: expected.publicId,
    asset_id: "asset",
    version: 123,
    resource_type: "image",
    type: "authenticated",
    access_control: [{ access_type: "token" }],
    format: "png",
    bytes: 1024,
    width: 1,
    height: 1,
  };
  it("accepts only a protected matching asset within the category limit", () => {
    expect(
      validateProviderAsset(image, expected, mediaPolicy("profile", "image")),
    ).toMatchObject({ asset_id: "asset", format: "png" });
    for (const patch of [
      { type: "upload" },
      { access_control: [] },
      { access_control: [{ access_type: "anonymous" }] },
      { public_id: "foreign" },
      { asset_id: "other" },
      { version: 124 },
      { bytes: 2 * 1024 * 1024 + 1 },
      { format: "svg" },
      { resource_type: "raw" },
    ])
      expect(() =>
        validateProviderAsset(
          { ...image, ...patch },
          expected,
          mediaPolicy("profile", "image"),
        ),
      ).toThrow(AppError);
  });
  it("requires actual provider-detected PDF instead of a raw file extension", () => {
    expect(() =>
      validateProviderAsset(
        { ...image, format: "pdf" },
        expected,
        mediaPolicy("document", "pdf"),
      ),
    ).not.toThrow();
    expect(() =>
      validateProviderAsset(
        { ...image, format: "pdf", resource_type: "raw" },
        expected,
        mediaPolicy("document", "pdf"),
      ),
    ).toThrow(AppError);
    expect(() => mediaPolicy("profile", "pdf")).toThrow(AppError);
  });
  it("enforces every agreed category at the exact source limit and one byte over", () => {
    const cases = [
      ["profile", "image", 2],
      ["poster", "image", 5],
      ["thumbnail", "image", 5],
      ["gallery", "image", 5],
      ["certificate", "image", 5],
      ["certificate", "pdf", 10],
      ["document", "pdf", 10],
    ] as const;
    for (const [category, kind, mib] of cases) {
      const policy = mediaPolicy(category, kind);
      const metadata = {
        ...image,
        format: kind === "pdf" ? "pdf" : "png",
        bytes: mib * 1048576,
      };
      expect(() =>
        validateProviderAsset(metadata, expected, policy),
      ).not.toThrow();
      expect(() =>
        validateProviderAsset(
          { ...metadata, bytes: metadata.bytes + 1 },
          expected,
          policy,
        ),
      ).toThrow(AppError);
    }
  });
});
