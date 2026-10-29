import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc, limitRegistration, origin } = vi.hoisted(() => ({
  rpc: vi.fn(),
  limitRegistration: vi.fn(),
  origin: { value: "http://localhost:3000" },
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ origin: origin.value }),
}));
vi.mock("@/lib/env/server", () => ({
  appOrigin: () => "http://localhost:3000",
}));
vi.mock("@/lib/supabase/service", () => ({ serviceClient: () => ({ rpc }) }));
vi.mock("@/lib/backend/rate-limit", () => ({ limitRegistration }));

import { submitRegistrationAction } from "@/app/(public)/join/actions";

const input = {
  full_name: "Calon Anggota",
  nim: " 105021800010 ",
  email: "calon@student.unklab.ac.id",
  phone: "0812-3456 7890",
  faculty: "Fakultas Ilmu Komputer",
  study_program: "Informatika",
  batch: 2026,
  skills: "",
  experience: "",
  motivation: "",
  portfolio_url: "",
  consent_data: true,
  consent_accuracy: true,
};

describe("submitRegistrationAction", () => {
  beforeEach(() => {
    rpc.mockReset();
    limitRegistration.mockReset().mockResolvedValue(undefined);
    origin.value = "http://localhost:3000";
  });

  it("rejects a foreign origin before the limiter or RPC", async () => {
    origin.value = "https://foreign.invalid";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await submitRegistrationAction(input);
    expect(result).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
    expect(limitRegistration).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith("registration.origin_rejected");
    expect(JSON.stringify(warn.mock.calls)).not.toContain("105021800010");
    warn.mockRestore();
  });

  it("maps validated fields to submit_registration arguments", async () => {
    rpc.mockResolvedValue({ data: "SUBMITTED", error: null });
    expect(await submitRegistrationAction(input)).toEqual({
      ok: true,
      data: null,
    });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc.mock.calls[0][0]).toBe("submit_registration");
    const sent = JSON.parse(JSON.stringify(rpc.mock.calls[0][1]));
    expect(sent).toEqual({
      p_full_name: "Calon Anggota",
      p_nim: "105021800010",
      p_email: "calon@student.unklab.ac.id",
      p_phone: "+6281234567890",
      p_faculty: "Fakultas Ilmu Komputer",
      p_study_program: "Informatika",
      p_batch: 2026,
    });
    expect(limitRegistration).toHaveBeenCalledWith(
      "calon@student.unklab.ac.id",
      "local",
    );
  });

  it("treats an unknown RPC status as SERVICE_UNAVAILABLE", async () => {
    rpc.mockResolvedValue({ data: "MAYBE", error: null });
    expect(await submitRegistrationAction(input)).toMatchObject({
      ok: false,
      error: { code: "SERVICE_UNAVAILABLE" },
    });
  });
});
