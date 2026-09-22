import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryEnv } from "@/lib/env/server";
import { AppError } from "@/lib/backend/errors";
import { mediaPolicy, uploadValidation } from "./policy";
import type { UploadIntent } from "./intent";
export function cloud() {
  cloudinary.config({
    ...cloudinaryEnv(),
    secure: true,
    signature_algorithm: "sha256",
  });
  return cloudinary;
}
export function signIntent(intent: UploadIntent) {
  const policy = mediaPolicy(intent.category, intent.kind);
  if (
    intent.preset !== policy.preset ||
    intent.max_bytes !== policy.maxBytes ||
    intent.status !== "PENDING"
  )
    throw new AppError("SERVICE_UNAVAILABLE");
  const params = {
    public_id: intent.public_id,
    timestamp: Math.floor(Date.parse(intent.issued_at) / 1000),
    upload_preset: policy.preset,
    overwrite: false,
    type: "authenticated",
    access_control: JSON.stringify([{ access_type: "token" }]),
    allowed_formats: policy.formats.join(","),
    eval: uploadValidation(policy),
  };
  const env = cloudinaryEnv();
  return {
    intent_id: intent.id,
    upload_url: `https://api.cloudinary.com/v1_1/${env.cloud_name}/image/upload`,
    api_key: env.api_key,
    params,
    signature: cloud().utils.api_sign_request(params, env.api_secret),
    expires_at: intent.expires_at,
    max_bytes: policy.maxBytes,
  };
}
export async function providerAsset(publicId: string) {
  try {
    return await cloud().api.resource(publicId, {
      resource_type: "image",
      type: "authenticated",
      timeout: 15000,
    });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "error" in error
        ? error.error
        : undefined;
    if (
      typeof code === "object" &&
      code !== null &&
      "http_code" in code &&
      code.http_code === 404
    )
      throw new AppError("NOT_FOUND");
    throw new AppError("SERVICE_UNAVAILABLE");
  }
}
// API download bypasses the blocked CDN only on the trusted server. Never return this URL to a browser.
export function protectedUrl(intent: UploadIntent) {
  if (!intent.version || !intent.format) throw new AppError("CONFLICT");
  return cloud().utils.private_download_url(intent.public_id, intent.format, {
    resource_type: "image",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 60,
    attachment: true,
  });
}
