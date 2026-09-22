import { beforeEach, describe, expect, it, vi } from "vitest";
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ serviceClient: () => ({ rpc }) }));
vi.mock("@/lib/env/server", () => ({
  rateNamespace: () => "test",
  serviceKey: () => "synthetic-hmac-key",
}));
import { consumeLimit, limitLogin } from "@/lib/backend/rate-limit";

describe("limiter failure policy", () => {
  beforeEach(() => rpc.mockReset());
  it("consumes both independent login buckets without leaking identity into storage", async () => {
    rpc.mockResolvedValue({
      data: { allowed: true, remaining: 4, retry_after_seconds: 10 },
      error: null,
    });
    await limitLogin("synthetic@example.invalid", "203.0.113.5");
    expect(rpc).toHaveBeenCalledTimes(2);
    const args = rpc.mock.calls.map((call) => call[1]);
    expect(args.map((a) => a.p_operation).sort()).toEqual([
      "login_email_ip",
      "login_ip",
    ]);
    expect(JSON.stringify(args)).not.toContain("synthetic@example.invalid");
    expect(args.every((a) => /^[a-f0-9]{64}$/.test(a.p_subject_hash))).toBe(
      true,
    );
  });
  it("reports outage even when the other bucket is exhausted", async () => {
    rpc.mockResolvedValueOnce({
      data: { allowed: false, remaining: 0, retry_after_seconds: 12 },
      error: null,
    });
    rpc.mockResolvedValueOnce({ data: null, error: { code: "timeout" } });
    await expect(
      limitLogin("a@example.invalid", "local"),
    ).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });
  it("returns the longest remaining quota window, and rejects malformed responses", async () => {
    rpc.mockResolvedValueOnce({
      data: { allowed: false, remaining: 0, retry_after_seconds: 3 },
      error: null,
    });
    rpc.mockResolvedValueOnce({
      data: { allowed: false, remaining: 0, retry_after_seconds: 9 },
      error: null,
    });
    await expect(
      limitLogin("a@example.invalid", "local"),
    ).rejects.toMatchObject({
      code: "RATE_LIMITED",
      details: { retryAfter: 9 },
    });
    rpc.mockResolvedValue({ data: { allowed: true }, error: null });
    await expect(
      consumeLimit("media_signature", ["fixture"]),
    ).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });
});
