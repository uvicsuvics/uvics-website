import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/backend/errors";
import {
  DUPLICATE_REGISTRATION_MESSAGE,
  INACTIVE_DEPARTMENT_MESSAGE,
  REGISTRATION_EMAIL_PATTERN,
  REGISTRATION_FIELD_MESSAGES,
  registrationFailureView,
  submitRegistration,
  type RegistrationOperations,
  type RegistrationStatus,
} from "@/lib/backend/registration";

const valid = {
  full_name: "Calon Anggota",
  nim: "105021800010",
  email: "calon@student.unklab.ac.id",
  phone: "+6281234567890",
  faculty: "Fakultas Ilmu Komputer",
  study_program: "Informatika",
  batch: 2026,
  skills: "SQL",
  experience: "",
  motivation: "Belajar bersama",
  portfolio_url: "https://example.invalid/portfolio",
  consent_data: true,
  consent_accuracy: true,
};

function operations(status: RegistrationStatus = "SUBMITTED") {
  return {
    limit: vi.fn<RegistrationOperations["limit"]>().mockResolvedValue(),
    submit: vi.fn<RegistrationOperations["submit"]>().mockResolvedValue(status),
  };
}

async function failure(raw: unknown, ops = operations()) {
  const error = await submitRegistration(raw, ops).catch((e: unknown) => e);
  expect(error).toBeInstanceOf(AppError);
  return error as AppError;
}

describe("public registration submission", () => {
  it("rejects missing consent and unknown fields before touching the limiter", async () => {
    const ops = operations();
    const consent = await failure({ ...valid, consent_data: false }, ops);
    expect(consent.code).toBe("VALIDATION_ERROR");
    expect(consent.details.fieldErrors?.consent_data?.length).toBeGreaterThan(
      0,
    );
    const unknown = await failure({ ...valid, status: "ACCEPTED" }, ops);
    expect(unknown.code).toBe("VALIDATION_ERROR");
    expect(ops.limit).not.toHaveBeenCalled();
  });

  it("rejects emails the SQL check rejects", async () => {
    const ops = operations();
    const error = await failure(
      { ...valid, email: "o'brien@example.com" },
      ops,
    );
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details.fieldErrors?.email?.length).toBeGreaterThan(0);
    expect(ops.limit).not.toHaveBeenCalled();
  });

  it("keeps email pattern identical to the SQL check", () => {
    const sql = readFileSync(
      "supabase/migrations/20260922120000_membership_foundation.sql",
      "utf8",
    );
    const block = sql.slice(
      sql.indexOf("create table public.registrations"),
      sql.indexOf(");", sql.indexOf("create table public.registrations")),
    );
    const match = block.match(
      /email text not null check\(email (~\*?) '([^']+)'\)/,
    );
    expect(match?.[1]).toBe("~*");
    expect(REGISTRATION_EMAIL_PATTERN.source).toBe(match?.[2]);
    expect(REGISTRATION_EMAIL_PATTERN.flags).toBe("i");
  });

  it("uses Indonesian validation messages for every field", async () => {
    const error = await failure({
      ...valid,
      nim: "1",
      email: "x",
      phone: "12",
      portfolio_url: "nope",
    });
    const fields = error.details.fieldErrors ?? {};
    for (const field of ["nim", "email", "phone", "portfolio_url"] as const)
      expect(fields[field]?.[0]).toBe(REGISTRATION_FIELD_MESSAGES[field]);
    expect(JSON.stringify(fields)).not.toMatch(
      /Invalid|Too small|expected|pattern/,
    );
  });

  it("enforces text and batch bounds", async () => {
    const year = new Date().getUTCFullYear();
    for (const override of [
      { motivation: "x".repeat(2001) },
      { skills: "x".repeat(1001) },
      { batch: 1999 },
      { batch: year + 2 },
    ])
      expect((await failure({ ...valid, ...override })).code).toBe(
        "VALIDATION_ERROR",
      );
    await expect(
      submitRegistration({ ...valid, batch: year + 1 }, operations()),
    ).resolves.toBeUndefined();
  });

  it("trims NIM before it reaches the RPC", async () => {
    const ops = operations();
    await submitRegistration({ ...valid, nim: " 105021800010 " }, ops);
    expect(ops.submit.mock.calls[0][0].nim).toBe("105021800010");
  });

  it("normalizes Indonesian phone before submit", async () => {
    const ops = operations();
    await submitRegistration({ ...valid, phone: "0812-3456 7890" }, ops);
    expect(ops.submit.mock.calls[0][0].phone).toBe("+6281234567890");
  });

  it("omits empty optional fields", async () => {
    const ops = operations();
    await submitRegistration(
      {
        ...valid,
        skills: "",
        experience: "",
        motivation: "",
        portfolio_url: "",
      },
      ops,
    );
    const input = ops.submit.mock.calls[0][0];
    expect(input.skills).toBeUndefined();
    expect(input.experience).toBeUndefined();
    expect(input.motivation).toBeUndefined();
    expect(input.portfolio_url).toBeUndefined();
    expect(input.preferred_department_id).toBeUndefined();
    expect(input).not.toHaveProperty("consent_data");
  });

  it("limits by normalized email before submitting", async () => {
    const ops = operations();
    await submitRegistration({ ...valid, email: " A@Example.Invalid " }, ops);
    expect(ops.limit).toHaveBeenCalledWith("a@example.invalid");
    expect(ops.limit.mock.invocationCallOrder[0]).toBeLessThan(
      ops.submit.mock.invocationCallOrder[0],
    );
  });

  it("does not submit when the limiter refuses", async () => {
    const ops = operations();
    ops.limit.mockRejectedValue(
      new AppError("RATE_LIMITED", { retryAfter: 30 }),
    );
    expect((await failure(valid, ops)).code).toBe("RATE_LIMITED");
    expect(ops.submit).not.toHaveBeenCalled();
  });

  it("maps CLOSED to FORBIDDEN", async () => {
    expect((await failure(valid, operations("CLOSED"))).code).toBe("FORBIDDEN");
  });

  it("maps DUPLICATE to CONFLICT on nim", async () => {
    const error = await failure(valid, operations("DUPLICATE"));
    expect(error.code).toBe("CONFLICT");
    expect(error.details.fieldErrors?.nim?.[0]).toBe(
      DUPLICATE_REGISTRATION_MESSAGE,
    );
  });

  it("maps INVALID_DEPARTMENT to VALIDATION_ERROR on preferred_department_id", async () => {
    const error = await failure(
      {
        ...valid,
        preferred_department_id: "00000000-0000-4000-8000-000000002801",
      },
      operations("INVALID_DEPARTMENT"),
    );
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details.fieldErrors?.preferred_department_id?.[0]).toBe(
      INACTIVE_DEPARTMENT_MESSAGE,
    );
  });

  it("hides RPC failures as SERVICE_UNAVAILABLE", async () => {
    const ops = operations();
    ops.submit.mockRejectedValue(new Error("pg detail"));
    const error = await failure(valid, ops);
    expect(error.code).toBe("SERVICE_UNAVAILABLE");
    expect(error.message).not.toContain("pg detail");
  });

  it("resolves without data on SUBMITTED", async () => {
    await expect(
      submitRegistration(valid, operations()),
    ).resolves.toBeUndefined();
  });
});

describe("registration failure view", () => {
  const rendered = ["full_name", "nim", "email"] as const;

  it("shows the closed state for FORBIDDEN", () => {
    expect(
      registrationFailureView({ code: "FORBIDDEN", message: "x" }, rendered),
    ).toEqual({ kind: "closed" });
  });

  it("returns rendered field errors in form order so the first can take focus", () => {
    expect(
      registrationFailureView(
        {
          code: "CONFLICT",
          message: "Data telah berubah.",
          field_errors: { email: ["e"], nim: [DUPLICATE_REGISTRATION_MESSAGE] },
        },
        rendered,
      ),
    ).toEqual({
      kind: "fields",
      fields: [
        ["nim", DUPLICATE_REGISTRATION_MESSAGE],
        ["email", "e"],
      ],
    });
  });

  it("falls back to a banner when no error maps to a rendered field", () => {
    const cases: Array<Record<string, string[]> | undefined> = [
      undefined,
      {},
      { preferred_department_id: [INACTIVE_DEPARTMENT_MESSAGE] },
      { nim: [] },
    ];
    for (const field_errors of cases)
      expect(
        registrationFailureView(
          {
            code: "VALIDATION_ERROR",
            message: "Periksa kembali.",
            field_errors,
          },
          rendered,
        ),
      ).toEqual({ kind: "banner", message: "Periksa kembali." });
  });
});
