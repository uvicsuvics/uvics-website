import { beforeEach, expect, it, vi } from "vitest";
const { rpc, upload, resource, update, intent } = vi.hoisted(() => ({
  rpc: vi.fn(),
  upload: vi.fn(),
  resource: vi.fn(),
  update: vi.fn(),
  intent: {
    id: "00000000-0000-4000-8000-000000000001",
    public_id: "uvics/pending/00000000-0000-4000-8000-000000000001",
    published_public_id: "uvics/published/00000000-0000-4000-8000-000000000001",
    asset_id: "original",
    format: "png",
    publication_status: "PUBLISHING",
  },
}));
vi.mock("@/lib/auth/admin", () => ({
  requireAdmin: async () => ({ id: "actor", sessionId: "session" }),
}));
vi.mock("@/lib/supabase/service", () => ({ serviceClient: () => ({ rpc }) }));
vi.mock("@/lib/env/server", () => ({
  cloudinaryEnv: () => ({ cloud_name: "synthetic" }),
}));
vi.mock("@/lib/media/cloudinary", () => ({
  cloud: () => ({ uploader: { upload }, api: { resource, update } }),
  protectedUrl: () => "https://provider.invalid/protected",
}));
vi.mock("@/lib/media/intent", () => ({ parseIntent: (data: unknown) => data }));
import { publishMedia } from "@/lib/media/publication";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
const client = createClient<Database>(
  "https://example.supabase.co",
  "synthetic-key",
);
beforeEach(() => {
  vi.clearAllMocks();
  rpc.mockResolvedValue({ data: intent, error: null });
  upload.mockResolvedValue({});
  update.mockResolvedValue({});
  resource.mockResolvedValue({
    asset_id: "copy",
    public_id: intent.published_public_id,
    resource_type: "image",
    type: "upload",
    format: "png",
    version: 1,
    context: { custom: { uvics_intent: intent.id, uvics_source: "original" } },
  });
});
it("stages a blocked copy and keeps it blocked if domain consent changes", async () => {
  const authorize = vi
    .fn()
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(Error("consent withdrawn"));
  await expect(
    publishMedia(
      client,
      intent.id,
      { type: "fixture", id: intent.id },
      authorize,
    ),
  ).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  expect(upload.mock.calls[0][1]).toMatchObject({
    access_control: [{ access_type: "token" }],
    overwrite: false,
  });
  expect(update).toHaveBeenCalledWith(
    intent.published_public_id,
    expect.objectContaining({ access_control: [{ access_type: "token" }] }),
  );
  expect(
    rpc.mock.calls.some((call) => call[0] === "finish_media_publication"),
  ).toBe(false);
  expect(
    rpc.mock.calls.some((call) => call[0] === "fail_media_publication"),
  ).toBe(true);
});

it("recovers a committed publication when its response is lost, without closing the successful asset", async () => {
  const committed = {
    ...intent,
    publication_status: "PUBLIC",
    published_asset_id: "copy",
    published_version: 1,
  };
  rpc.mockImplementation(async (name: string) => {
    if (name === "begin_media_publication")
      return { data: intent, error: null };
    if (name === "finish_media_publication")
      return { data: null, error: { code: "timeout" } };
    if (name === "read_upload_intent") return { data: committed, error: null };
    return { data: null, error: null };
  });
  await expect(
    publishMedia(
      client,
      intent.id,
      { type: "fixture", id: intent.id },
      async () => {},
    ),
  ).resolves.toMatchObject({ access: "PUBLIC", version: 1 });
  expect(
    update.mock.calls.some(
      (call) => call[1].access_control?.[0]?.access_type === "token",
    ),
  ).toBe(false);
});

it("reconciles a PUBLIC row with a blocked CDN before returning its URL on retry", async () => {
  rpc.mockResolvedValue({
    data: {
      ...intent,
      publication_status: "PUBLIC",
      published_asset_id: "copy",
      published_version: 1,
    },
    error: null,
  });
  const asset = {
    asset_id: "copy",
    public_id: intent.published_public_id,
    resource_type: "image",
    type: "upload",
    format: "png",
    version: 1,
    context: { custom: { uvics_intent: intent.id, uvics_source: "original" } },
  };
  resource
    .mockResolvedValueOnce({
      ...asset,
      access_control: [{ access_type: "token" }],
    })
    .mockResolvedValueOnce(asset);
  await expect(
    publishMedia(
      client,
      intent.id,
      { type: "fixture", id: intent.id },
      async () => {},
    ),
  ).resolves.toMatchObject({ access: "PUBLIC" });
  expect(update).toHaveBeenCalledWith(
    intent.published_public_id,
    expect.objectContaining({ access_control: [] }),
  );
  expect(upload).not.toHaveBeenCalled();
});
