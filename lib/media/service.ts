import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import type { AdminIdentity } from "@/lib/auth/login";
import { serviceClient } from "@/lib/supabase/service";
import { consumeLimit } from "@/lib/backend/rate-limit";
import { AppError, databaseError } from "@/lib/backend/errors";
import {
  completeSchema,
  signatureSchema,
  mediaPolicy,
  validateProviderAsset,
} from "./policy";
import { parseIntent, completedMedia } from "./intent";
import { signIntent, providerAsset } from "./cloudinary";
export async function readIntent(admin: AdminIdentity, id: string) {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) throw new AppError("VALIDATION_ERROR");
  const { data, error } = await serviceClient().rpc("read_upload_intent", {
    p_actor: admin.id,
    p_session: admin.sessionId,
    p_intent: parsed.data,
  });
  if (error) databaseError(error);
  return parseIntent(data);
}
export async function createSignedUpload(
  client: SupabaseClient<Database>,
  input: unknown,
) {
  const admin = await requireAdmin(client);
  const parsed = signatureSchema.safeParse(input);
  if (!parsed.success) throw new AppError("VALIDATION_ERROR");
  mediaPolicy(parsed.data.category, parsed.data.kind);
  await consumeLimit("media_signature", [admin.id]);
  const { data, error } = await serviceClient().rpc("create_upload_intent", {
    p_actor: admin.id,
    p_session: admin.sessionId,
    p_category: parsed.data.category,
    p_kind: parsed.data.kind,
  });
  if (error) databaseError(error);
  return signIntent(parseIntent(data));
}
export async function completeUpload(
  client: SupabaseClient<Database>,
  input: unknown,
) {
  const admin = await requireAdmin(client);
  const parsed = completeSchema.safeParse(input);
  if (!parsed.success) throw new AppError("VALIDATION_ERROR");
  await consumeLimit("media_complete", [admin.id]);
  const value = parsed.data;
  const intent = await readIntent(admin, value.intent_id);
  const service = serviceClient();
  const context = {
    p_actor: admin.id,
    p_session: admin.sessionId,
    p_intent: intent.id,
  };
  if (intent.status === "COMPLETED") {
    if (intent.asset_id !== value.asset_id || intent.version !== value.version)
      throw new AppError("CONFLICT");
    return completedMedia(intent);
  }
  if (intent.status !== "PENDING") throw new AppError("CONFLICT");
  if (Date.now() >= Date.parse(intent.expires_at)) {
    const { error } = await service.rpc("reject_upload_intent", context);
    if (error) databaseError(error);
    throw new AppError("CONFLICT");
  }
  const raw = await providerAsset(intent.public_id);
  let asset;
  try {
    asset = validateProviderAsset(
      raw,
      {
        publicId: intent.public_id,
        assetId: value.asset_id,
        version: value.version,
      },
      mediaPolicy(intent.category, intent.kind),
    );
  } catch (error) {
    const { error: rejection } = await service.rpc(
      "reject_upload_intent",
      context,
    );
    if (rejection) databaseError(rejection);
    throw error;
  }
  const { data, error } = await service.rpc("complete_upload_intent", {
    ...context,
    p_asset_id: asset.asset_id,
    p_version: asset.version,
    p_format: asset.format,
    p_bytes: asset.bytes,
    p_width: asset.width ?? 0,
    p_height: asset.height ?? 0,
  });
  if (error) databaseError(error);
  return completedMedia(parseIntent(data));
}
