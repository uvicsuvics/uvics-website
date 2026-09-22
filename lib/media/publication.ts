import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types/database";
import { requireAdmin } from "@/lib/auth/admin";
import { serviceClient } from "@/lib/supabase/service";
import { AppError, databaseError } from "@/lib/backend/errors";
import { cloudinaryEnv } from "@/lib/env/server";
import { cloud, protectedUrl } from "./cloudinary";
import { parseIntent, type UploadIntent } from "./intent";
const referenceSchema = z.object({
  type: z.string().regex(/^[a-z][a-z0-9_]{0,63}$/),
  id: z.uuid(),
});
const publishedSchema = z.object({
  asset_id: z.string(),
  public_id: z.string(),
  resource_type: z.literal("image"),
  type: z.literal("upload"),
  format: z.string(),
  version: z.number().int().positive(),
  access_control: z.array(z.object({ access_type: z.string() })).optional(),
  context: z.object({
    custom: z.object({ uvics_intent: z.string(), uvics_source: z.string() }),
  }),
});
async function readPublishedAsset(intent: UploadIntent) {
  const raw = await cloud().api.resource(intent.published_public_id!, {
    resource_type: "image",
    type: "upload",
    context: true,
    timeout: 15000,
  });
  const parsed = publishedSchema.safeParse(raw);
  if (
    !parsed.success ||
    parsed.data.public_id !== intent.published_public_id ||
    parsed.data.format !== intent.format ||
    parsed.data.context.custom.uvics_intent !== intent.id ||
    parsed.data.context.custom.uvics_source !== intent.asset_id ||
    (intent.published_asset_id &&
      parsed.data.asset_id !== intent.published_asset_id) ||
    (intent.published_version &&
      parsed.data.version !== intent.published_version)
  )
    throw new AppError("CONFLICT");
  return parsed.data;
}
async function reconcilePublic(
  intent: UploadIntent,
  authorize: () => Promise<void>,
) {
  try {
    const asset = await readPublishedAsset(intent);
    if (asset.access_control?.length) {
      await authorize();
      await cloud().api.update(intent.published_public_id!, {
        resource_type: "image",
        type: "upload",
        access_control: [],
        timeout: 15000,
      });
      if ((await readPublishedAsset(intent)).access_control?.length)
        throw new AppError("SERVICE_UNAVAILABLE");
    }
    return publicMedia(intent);
  } catch {
    console.error("media.publication_reconciliation_required");
    throw new AppError("SERVICE_UNAVAILABLE");
  }
}
function publicMedia(intent: UploadIntent) {
  if (
    intent.publication_status !== "PUBLIC" ||
    !intent.published_public_id ||
    !intent.published_version ||
    !intent.format
  )
    throw new AppError("CONFLICT");
  return {
    id: intent.id,
    public_id: intent.published_public_id,
    version: intent.published_version,
    format: z.enum(["jpg", "png", "webp"]).parse(intent.format),
    cloud_name: cloudinaryEnv().cloud_name,
    width: intent.width,
    height: intent.height,
    access: "PUBLIC" as const,
  };
}
/** Internal only: domain workflow must verify live publication/consent in authorize. */
export async function publishMedia(
  client: SupabaseClient<Database>,
  intentId: string,
  reference: z.infer<typeof referenceSchema>,
  authorize: () => Promise<void>,
) {
  const admin = await requireAdmin(client);
  const ref = referenceSchema.safeParse(reference);
  if (!ref.success || !z.uuid().safeParse(intentId).success)
    throw new AppError("VALIDATION_ERROR");
  await authorize();
  const service = serviceClient();
  const context = {
    p_actor: admin.id,
    p_session: admin.sessionId,
    p_intent: intentId,
  };
  const { data, error } = await service.rpc("begin_media_publication", {
    ...context,
    p_reference_type: ref.data.type,
    p_reference_id: ref.data.id,
  });
  if (error) databaseError(error);
  const intent = parseIntent(data);
  if (intent.publication_status === "PUBLIC")
    return reconcilePublic(intent, authorize);
  if (!intent.published_public_id || !intent.asset_id)
    throw new AppError("CONFLICT");
  let finishAttempted = false;
  try {
    await cloud().uploader.upload(protectedUrl(intent), {
      resource_type: "image",
      type: "upload",
      access_control: [{ access_type: "token" }],
      public_id: intent.published_public_id,
      overwrite: false,
      context: { uvics_intent: intent.id, uvics_source: intent.asset_id },
      timeout: 20000,
    });
    const asset = await readPublishedAsset(intent);
    await authorize(); // Status konten dapat berubah selama operasi provider.
    await cloud().api.update(intent.published_public_id, {
      resource_type: "image",
      type: "upload",
      access_control: [],
      timeout: 15000,
    });
    finishAttempted = true;
    const { data: finished, error: finishError } = await service.rpc(
      "finish_media_publication",
      {
        ...context,
        p_asset_id: asset.asset_id,
        p_version: asset.version,
      },
    );
    if (finishError) databaseError(finishError);
    return publicMedia(parseIntent(finished));
  } catch {
    // A timeout does not prove rollback: the transaction may already be PUBLIC.
    if (finishAttempted) {
      try {
        const { data: current, error: readError } = await service.rpc(
          "read_upload_intent",
          context,
        );
        if (readError) databaseError(readError);
        const persisted = parseIntent(current);
        if (persisted.publication_status === "PUBLIC") {
          await authorize();
          return await reconcilePublic(persisted, authorize);
        }
      } catch {
        console.error("media.publication_commit_reconciliation_required");
      }
    }
    // A failed cross-provider transaction must not leave its staged copy public.
    try {
      await cloud().api.update(intent.published_public_id, {
        resource_type: "image",
        type: "upload",
        access_control: [{ access_type: "token" }],
        timeout: 15000,
      });
    } catch {
      console.error("media.publication_access_reconciliation_required");
    }
    const { error: markError } = await service.rpc(
      "fail_media_publication",
      context,
    );
    if (markError) console.error("media.publication_reconciliation_required");
    throw new AppError("SERVICE_UNAVAILABLE");
  }
}
