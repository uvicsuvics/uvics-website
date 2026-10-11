import { readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { required, target, psql } from "./tooling.mjs";

const [project, cloudName, manifestPath, ...flags] = process.argv.slice(2);
if (
  project !== target() ||
  cloudName !== required("CLOUDINARY_CLOUD_NAME") ||
  !manifestPath
) {
  throw Error(
    "Usage: node scripts/cleanup-media.mjs <verified-project> <verified-cloud> <manifest> [--apply] [--release-fixture]",
  );
}
const manifest = z
  .object({
    owner_id: z.uuid(),
    intents: z.array(
      z.object({ id: z.uuid(), public_id: z.string() }).passthrough(),
    ),
  })
  .passthrough()
  .parse(JSON.parse(readFileSync(manifestPath, "utf8")));
cloudinary.config({
  cloud_name: cloudName,
  api_key: required("CLOUDINARY_API_KEY"),
  api_secret: required("CLOUDINARY_API_SECRET"),
  secure: true,
});
const apply = flags.includes("--apply");
const releaseFixture = flags.includes("--release-fixture");
if (releaseFixture) {
  const fixture = JSON.parse(
    readFileSync(".runtime/auth-fixtures.json", "utf8"),
  );
  if (
    !fixture.users.some(
      (u) =>
        u.id === manifest.owner_id &&
        /^uvics-.*@example\.invalid$/.test(u.email),
    )
  )
    throw Error("Unrecognized synthetic owner");
}
async function find(publicId, resourceType, type) {
  try {
    return await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
      type,
      timeout: 15000,
    });
  } catch (error) {
    if (error?.error?.http_code === 404 || error?.http_code === 404)
      return null;
    throw Error("Cloudinary inventory unavailable; nothing else deleted");
  }
}
for (const entry of manifest.intents) {
  const row = JSON.parse(
    psql(
      `select to_jsonb(i) || jsonb_build_object('ready_by_clock',statement_timestamp()>=cleanup_not_before) from private.upload_intents i where id='${entry.id}'::uuid;`,
    ).trim() || "null",
  );
  if (!row) {
    console.log(
      JSON.stringify({ id: entry.id, state: "missing-row-manual-review" }),
    );
    continue;
  }
  if (
    row.owner_id !== manifest.owner_id ||
    row.public_id !== entry.public_id ||
    row.public_id !== `uvics/pending/${entry.id}`
  )
    throw Error("Manifest/row mismatch");
  if (row.cleanup_status === "CLEANED") {
    console.log(JSON.stringify({ id: entry.id, state: "already-cleaned" }));
    continue;
  }
  const canRelease = releaseFixture && row.reference_type === "issue7_fixture";
  if (!row.ready_by_clock || (row.reference_id && !canRelease)) {
    console.log(
      JSON.stringify({
        id: entry.id,
        state: row.ready_by_clock ? "referenced" : "held",
        cleanup_not_before: row.cleanup_not_before,
      }),
    );
    continue;
  }
  if (!apply) {
    console.log(
      JSON.stringify({
        id: entry.id,
        state: "eligible-dry-run",
        releases_synthetic_reference: !!canRelease,
      }),
    );
    continue;
  }
  // Claim is committed before external deletion. All server RPCs then refuse reuse.
  psql(
    `begin; ${canRelease ? `update private.upload_intents set reference_id=null,reference_type=null where id='${entry.id}'::uuid and reference_type='issue7_fixture' and statement_timestamp()>=cleanup_not_before;` : ""} select private.claim_media_cleanup('${entry.id}'::uuid); commit;`,
  );
  const identities = [];
  for (const publicId of [row.public_id, row.published_public_id].filter(
    Boolean,
  )) {
    for (const resourceType of ["image", "raw", "video"]) {
      for (const type of ["authenticated", "upload"]) {
        const asset = await find(publicId, resourceType, type);
        if (!asset) continue;
        const expected =
          publicId === row.public_id ? row.asset_id : row.published_asset_id;
        if (resourceType === "image" && expected && asset.asset_id !== expected)
          throw Error("Asset identity changed; manual reconciliation required");
        identities.push({
          asset_id: asset.asset_id,
          public_id: publicId,
          resource_type: resourceType,
          type,
        });
      }
    }
  }
  entry.cleanup_inventory = identities;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  for (const asset of identities) {
    await cloudinary.api.delete_resources_by_asset_ids([asset.asset_id], {
      resource_type: asset.resource_type,
      type: asset.type,
      invalidate: true,
      timeout: 15000,
    });
    if (await find(asset.public_id, asset.resource_type, asset.type))
      throw Error("Deletion not yet confirmed; retry safely");
  }
  psql(
    `update private.upload_intents set cleanup_status='CLEANED' where id='${entry.id}'::uuid and cleanup_status='READY' and reference_id is null;`,
  );
  entry.cleaned_at = new Date().toISOString();
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(
    JSON.stringify({
      id: entry.id,
      state: "cleaned",
      asset_count: identities.length,
    }),
  );
}
