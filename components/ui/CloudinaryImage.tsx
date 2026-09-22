"use client";
import Image from "next/image";
import { publicImageUrl, type PublicImage } from "@/lib/media/public-image";
/** Public DTO only. Private documents never pass through this loader. */
export function CloudinaryImage({
  asset,
  alt,
  width,
  height,
  sizes,
  priority = false,
}: {
  asset: PublicImage;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <Image
      loader={({ width: requested }) => publicImageUrl(asset, requested)}
      src={asset.public_id}
      width={width}
      height={height}
      alt={alt}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
