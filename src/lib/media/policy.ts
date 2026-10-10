import { z } from "zod";
import { AppError } from "@/src/lib/backend/errors";
export const categorySchema = z.enum([
  "profile",
  "poster",
  "thumbnail",
  "gallery",
  "certificate",
  "document",
]);
export type MediaCategory = z.infer<typeof categorySchema>;
export function uploadValidation(policy: {
  maxBytes: number;
  formats: string[];
}) {
  return `upload_options.unique_filename=false; if (typeof resource_info.bytes !== "number" || resource_info.bytes > ${policy.maxBytes}) { throw new Error("UVICS_FILE_TOO_LARGE"); } if (${JSON.stringify(policy.formats)}.indexOf(resource_info.format) === -1) { throw new Error("UVICS_FILE_FORMAT"); }`;
}
export const signatureSchema = z
  .object({ category: categorySchema, kind: z.enum(["image", "pdf"]) })
  .strict();
export const completeSchema = z
  .object({
    intent_id: z.uuid(),
    asset_id: z.string().min(1).max(128),
    version: z.number().int().positive(),
  })
  .strict();
export function mediaPolicy(category: MediaCategory, kind: "image" | "pdf") {
  if (
    (kind === "pdf" && !["certificate", "document"].includes(category)) ||
    (category === "document" && kind !== "pdf")
  )
    throw new AppError("VALIDATION_ERROR");
  const maxBytes =
    (kind === "pdf" ? 10 : category === "profile" ? 2 : 5) * 1024 * 1024;
  return {
    category,
    kind,
    maxBytes,
    formats: kind === "pdf" ? ["pdf"] : ["jpg", "png", "webp"],
    preset: `uvics_${kind}_${maxBytes / 1024 / 1024}mb_v1`,
    resourceType: "image" as const,
    deliveryType: "authenticated" as const,
  };
}
export const providerAssetSchema = z.object({
  public_id: z.string(),
  asset_id: z.string(),
  version: z.number().int().positive(),
  resource_type: z.literal("image"),
  type: z.literal("authenticated"),
  access_control: z.tuple([
    z.object({ access_type: z.literal("token") }).strict(),
  ]),
  format: z.string(),
  bytes: z.number().int().positive(),
  width: z.number().optional(),
  height: z.number().optional(),
});
export type ProviderAsset = z.infer<typeof providerAssetSchema>;
export function validateProviderAsset(
  raw: unknown,
  expected: { publicId: string; assetId: string; version: number },
  policy: ReturnType<typeof mediaPolicy>,
): ProviderAsset {
  const parsed = providerAssetSchema.safeParse(raw);
  if (!parsed.success) throw new AppError("VALIDATION_ERROR");
  const asset = parsed.data;
  if (
    asset.public_id !== expected.publicId ||
    asset.asset_id !== expected.assetId ||
    asset.version !== expected.version ||
    !policy.formats.includes(asset.format) ||
    asset.bytes > policy.maxBytes
  )
    throw new AppError("VALIDATION_ERROR");
  return asset;
}
