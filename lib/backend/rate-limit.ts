import "server-only";
import { createHmac } from "node:crypto";
import { z } from "zod";
import { serviceClient } from "@/lib/supabase/service";
import { rateNamespace, serviceKey } from "@/lib/env/server";
import { AppError } from "./errors";
const resultSchema = z.object({
  allowed: z.boolean(),
  remaining: z.number().int().nonnegative(),
  retry_after_seconds: z.number().int().positive(),
});
type Operation =
  | "login_email_ip"
  | "login_ip"
  | "media_signature"
  | "media_complete"
  | "registration_email_ip"
  | "registration_ip";
export async function consumeLimit(operation: Operation, parts: string[]) {
  const subject = createHmac("sha256", serviceKey())
    .update(JSON.stringify([rateNamespace(), operation, ...parts]))
    .digest("hex");
  const { data, error } = await serviceClient().rpc("consume_rate_limit", {
    p_namespace: rateNamespace(),
    p_operation: operation,
    p_subject_hash: subject,
  });
  const parsed = resultSchema.safeParse(data);
  if (error || !parsed.success) throw new AppError("SERVICE_UNAVAILABLE");
  if (!parsed.data.allowed)
    throw new AppError("RATE_LIMITED", {
      retryAfter: parsed.data.retry_after_seconds,
    });
}
async function consumeBuckets(buckets: Array<[Operation, string[]]>) {
  // Semua bucket dikonsumsi meski salah satu menolak; transaksi operasi bisnis terpisah.
  const results = await Promise.allSettled(
    buckets.map(([operation, parts]) => consumeLimit(operation, parts)),
  );
  const failed = results
    .filter((r) => r.status === "rejected")
    .map((r) => r.reason);
  if (failed.some((e) => !(e instanceof AppError) || e.code !== "RATE_LIMITED"))
    throw new AppError("SERVICE_UNAVAILABLE");
  if (failed.length)
    throw new AppError("RATE_LIMITED", {
      retryAfter: Math.max(
        ...failed.map((e) =>
          e instanceof AppError ? e.details.retryAfter || 60 : 60,
        ),
      ),
    });
}
export async function limitLogin(email: string, ip: string) {
  await consumeBuckets([
    ["login_email_ip", [email, ip]],
    ["login_ip", [ip]],
  ]);
}
export async function limitRegistration(email: string, ip: string) {
  await consumeBuckets([
    ["registration_email_ip", [email, ip]],
    ["registration_ip", [ip]],
  ]);
}
