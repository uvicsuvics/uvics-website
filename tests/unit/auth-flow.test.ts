import { expect, it, vi } from "vitest";
import { loginAdmin, type LoginOperations } from "@/src/lib/auth/login";
import { AppError } from "@/src/lib/backend/errors";
function operations(): LoginOperations {
  return {
    limit: vi.fn(async () => {}),
    authenticate: vi.fn(async () => {}),
    authorize: vi.fn(async () => ({
      id: "admin",
      sessionId: "session",
      name: "Synthetic",
    })),
    audit: vi.fn(async () => {}),
    revoke: vi.fn(async () => {}),
  };
}
const input = { email: "synthetic@example.invalid", password: " preserve " };
it("does not contact Auth when quota or limiter is unavailable", async () => {
  for (const code of ["RATE_LIMITED", "SERVICE_UNAVAILABLE"] as const) {
    const o = operations();
    o.limit = vi.fn(async () => {
      throw new AppError(code);
    });
    await expect(loginAdmin(input, o)).rejects.toMatchObject({ code });
    expect(o.authenticate).not.toHaveBeenCalled();
  }
});
it("revokes a newly issued session when nonadmin or audit failure prevents acceptance", async () => {
  for (const stage of ["authorize", "audit"] as const) {
    const o = operations();
    o[stage] = vi.fn(async () => {
      throw new AppError(
        stage === "audit" ? "SERVICE_UNAVAILABLE" : "FORBIDDEN",
      );
    });
    await expect(loginAdmin(input, o)).rejects.toMatchObject({
      code: stage === "audit" ? "SERVICE_UNAVAILABLE" : "INVALID_CREDENTIALS",
    });
    expect(o.revoke).toHaveBeenCalledTimes(1);
  }
});
it("reports compensation failure as outage rather than successful logout", async () => {
  const o = operations();
  o.audit = vi.fn(async () => {
    throw new AppError("SERVICE_UNAVAILABLE");
  });
  o.revoke = vi.fn(async () => {
    throw Error("provider unavailable");
  });
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  await expect(loginAdmin(input, o)).rejects.toMatchObject({
    code: "SERVICE_UNAVAILABLE",
  });
  expect(log).toHaveBeenCalledWith("auth.login_compensation_failed");
  log.mockRestore();
});
it("accepts only after audit and preserves the password", async () => {
  const o = operations();
  await expect(loginAdmin(input, o)).resolves.toMatchObject({ id: "admin" });
  expect(o.authenticate).toHaveBeenCalledWith(input);
  expect(o.audit).toHaveBeenCalledTimes(1);
  expect(o.revoke).not.toHaveBeenCalled();
});
