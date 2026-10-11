import { isIP } from "node:net";
import { AppError } from "./errors";
export function assertOrigin(origin: string | null, trustedOrigin: string) {
  if (!origin || origin === "null" || origin !== trustedOrigin)
    throw new AppError("FORBIDDEN");
}
export function trustedIp(
  headers: Headers,
  origin: string,
  vercel: boolean,
): string {
  if (vercel) {
    const ip = headers.get("x-vercel-forwarded-for");
    if (ip && isIP(ip)) return ip;
    throw new AppError("SERVICE_UNAVAILABLE");
  }
  const host = new URL(origin).hostname;
  if (["localhost", "127.0.0.1", "[::1]"].includes(host)) return "local";
  // Hosting lain wajib mendefinisikan kontrak proxy sebelum menerima forwarded IP.
  throw new AppError("SERVICE_UNAVAILABLE");
}
export async function readJson(request: Request): Promise<unknown> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  )
    throw new AppError("VALIDATION_ERROR");
  if (Number(request.headers.get("content-length")) > 8192)
    throw new AppError("VALIDATION_ERROR");
  const reader = request.body?.getReader();
  if (!reader) throw new AppError("VALIDATION_ERROR");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 8192) {
        await reader.cancel();
        throw new AppError("VALIDATION_ERROR");
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new AppError("VALIDATION_ERROR");
  }
}
