import { z } from "zod";
export const publicImageSchema = z.object({
  cloud_name: z.string().regex(/^[a-z0-9_-]+$/),
  public_id: z.string().regex(/^uvics\/published\/[a-f0-9-]{36}$/),
  version: z.number().int().positive(),
  format: z.enum(["jpg", "png", "webp"]),
  access: z.literal("PUBLIC"),
});
export type PublicImage = z.infer<typeof publicImageSchema>;
export function publicImageUrl(raw: PublicImage, width: number) {
  const image = publicImageSchema.parse(raw);
  if (!Number.isInteger(width) || width < 1 || width > 4096)
    throw Error("Invalid image width");
  return `https://res.cloudinary.com/${image.cloud_name}/image/upload/c_limit,w_${width},q_auto,f_auto/v${image.version}/${image.public_id}.${image.format}`;
}
