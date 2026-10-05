import "server-only";
import { z } from "zod";
import { AppError } from "@/src/lib/backend/errors";
function checked<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new AppError("SERVICE_UNAVAILABLE");
  return result.data;
}
export function appOrigin() {
  const value = checked(z.url(), process.env.APP_ORIGIN);
  const url = new URL(value);
  if (
    url.origin !== value ||
    !["http:", "https:"].includes(url.protocol) ||
    (url.protocol === "http:" &&
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
  )
    throw new AppError("SERVICE_UNAVAILABLE");
  return value;
}
export function serviceKey() {
  return checked(
    z.string().min(20),
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
export function cloudinaryEnv() {
  return checked(
    z.object({
      cloud_name: z.string().regex(/^[a-z0-9_-]+$/),
      api_key: z.string().min(1),
      api_secret: z.string().min(1),
    }),
    {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    },
  );
}
export function rateNamespace() {
  return checked(
    z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
    process.env.RATE_LIMIT_NAMESPACE || "uvics",
  );
}
