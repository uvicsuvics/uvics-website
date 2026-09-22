import { z } from "zod";
import { AppError } from "@/lib/backend/errors";
import { categorySchema } from "./policy";
export const intentSchema = z.object({
  id: z.uuid(),
  owner_id: z.uuid(),
  category: categorySchema,
  kind: z.enum(["image", "pdf"]),
  public_id: z.string().regex(/^uvics\/pending\/[a-f0-9-]{36}$/),
  resource_type: z.literal("image"),
  delivery_type: z.literal("authenticated"),
  preset: z.string(),
  max_bytes: z.number().int().positive(),
  issued_at: z.string(),
  expires_at: z.string(),
  cleanup_not_before: z.string(),
  status: z.enum(["PENDING", "COMPLETED", "REJECTED", "EXPIRED"]),
  asset_id: z.string().nullable(),
  version: z.number().nullable(),
  format: z.string().nullable(),
  bytes: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  publication_status: z.enum(["PRIVATE", "PUBLISHING", "PUBLIC", "FAILED"]),
  published_public_id: z.string().nullable(),
  published_asset_id: z.string().nullable(),
  published_version: z.number().nullable(),
  reference_type: z.string().nullable(),
  reference_id: z.uuid().nullable(),
});
export type UploadIntent = z.infer<typeof intentSchema>;
export function parseIntent(input: unknown) {
  const result = intentSchema.safeParse(input);
  if (!result.success) throw new AppError("SERVICE_UNAVAILABLE");
  return result.data;
}
export function completedMedia(intent: UploadIntent) {
  if (intent.status !== "COMPLETED") throw new AppError("CONFLICT");
  return {
    id: intent.id,
    category: intent.category,
    kind: intent.kind,
    format: intent.format,
    bytes: intent.bytes,
    width: intent.width,
    height: intent.height,
    access: "PRIVATE" as const,
    download_url: `/api/admin/media/${intent.id}`,
  };
}
