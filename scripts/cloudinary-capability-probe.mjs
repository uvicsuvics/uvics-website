import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { required } from "./tooling.mjs";
cloudinary.config({
  cloud_name: required("CLOUDINARY_CLOUD_NAME"),
  api_key: required("CLOUDINARY_API_KEY"),
  api_secret: required("CLOUDINARY_API_SECRET"),
  secure: true,
});
const id = "uvics/probe/" + randomUUID();
const manifest = {
  public_id: id,
  asset_id: null,
  resource_type: "image",
  type: "authenticated",
  cleanup_not_before: new Date(Date.now() + 65 * 60000).toISOString(),
};
mkdirSync(".runtime", { recursive: true });
const path = `.runtime/cloud-probe-${id.split("/").pop()}.json`;
writeFileSync(path, JSON.stringify(manifest, null, 2));
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOZkAAAAASUVORK5CYII=";
try {
  const result = await cloudinary.uploader.upload(png, {
    public_id: id,
    type: "authenticated",
    overwrite: false,
    eval: 'if (resource_info.bytes > 1) { throw new Error("UVICS_FILE_TOO_LARGE"); }',
  });
  manifest.asset_id = result.asset_id;
  writeFileSync(path, JSON.stringify(manifest, null, 2));
  console.log(
    JSON.stringify({
      rejected: false,
      asset_id: result.asset_id,
      bytes: result.bytes,
      info: result.info,
    }),
  );
} catch (error) {
  console.log(
    JSON.stringify({
      rejected: true,
      http_code: error.http_code,
      message: error.message,
    }),
  );
}
try {
  const asset = await cloudinary.api.resource(id, {
    resource_type: "image",
    type: "authenticated",
  });
  manifest.asset_id = asset.asset_id;
  writeFileSync(path, JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify({ persisted: true, asset_id: asset.asset_id }));
} catch (error) {
  console.log(
    JSON.stringify({
      persisted: false,
      status: error.error?.http_code || error.http_code,
    }),
  );
}
