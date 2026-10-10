import { v2 as cloudinary } from "cloudinary";
import { mediaPolicy, uploadValidation } from "../lib/media/policy";
import { required } from "./tooling.mjs";
cloudinary.config({
  cloud_name: required("CLOUDINARY_CLOUD_NAME"),
  api_key: required("CLOUDINARY_API_KEY"),
  api_secret: required("CLOUDINARY_API_SECRET"),
  secure: true,
});
if (process.argv[2] !== required("CLOUDINARY_CLOUD_NAME"))
  throw Error("Pass verified cloud name explicitly.");
for (const policy of [
  mediaPolicy("profile", "image"),
  mediaPolicy("poster", "image"),
  mediaPolicy("document", "pdf"),
]) {
  const settings = {
    unsigned: false,
    type: "authenticated",
    access_control: [{ access_type: "token" as const }],
    overwrite: false,
    allowed_formats: policy.formats,
    eval: uploadValidation(policy),
    use_filename: false,
    unique_filename: false,
  };
  const presets = await cloudinary.api.upload_presets({ max_results: 100 });
  if (presets.presets.some((p: { name: string }) => p.name === policy.preset))
    await cloudinary.api.update_upload_preset(policy.preset, settings);
  else
    await cloudinary.api.create_upload_preset({
      name: policy.preset,
      ...settings,
    });
  const configured = await cloudinary.api.upload_preset(policy.preset);
  const access =
    typeof configured.settings.access_control === "string"
      ? JSON.parse(configured.settings.access_control)
      : configured.settings.access_control;
  if (
    configured.unsigned ||
    configured.settings.type !== "authenticated" ||
    configured.settings.eval !== settings.eval ||
    configured.settings.overwrite !== false ||
    JSON.stringify(access) !== JSON.stringify(settings.access_control)
  )
    throw Error("Preset verification failed");
  console.log(
    JSON.stringify({
      preset: policy.preset,
      status: "verified",
      max_bytes: policy.maxBytes,
      delivery: "authenticated",
      size_enforcement: "pre-upload eval",
    }),
  );
}
