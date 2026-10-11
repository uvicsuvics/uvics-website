import "./tooling.mjs";
import { required, target, psql } from "./tooling.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { publishMedia } from "../lib/media/publication";
import { publicImageUrl } from "../lib/media/public-image";
import { cloud } from "../lib/media/cloudinary";

if (process.argv[2] !== target() || !process.argv[3])
  throw Error("Pass verified project and synthetic media manifest.");
const path = process.argv[3];
const credentials = JSON.parse(
  readFileSync(".runtime/auth-credentials.json", "utf8"),
);
const manifest = JSON.parse(readFileSync(path, "utf8"));
const fixtures = JSON.parse(
  readFileSync(".runtime/auth-fixtures.json", "utf8"),
);
const owner = fixtures.users.find(
  (u: { id: string }) => u.id === manifest.owner_id,
);
if (!owner || !owner.email.endsWith("@example.invalid"))
  throw Error("Synthetic owner required");
const entry = manifest.intents.find(
  (i: { category: string; asset_id?: string }) =>
    i.category === "poster" && i.asset_id,
);
if (!entry) throw Error("Completed poster fixture required");
const client = createClient<Database>(
  required("NEXT_PUBLIC_SUPABASE_URL"),
  required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const login = await client.auth.signInWithPassword({
  email: owner.email,
  password: credentials.users.find((u: { id: string }) => u.id === owner.id)
    ?.password,
});
assert.equal(!!login.error, false, "synthetic login");
const reference = {
  type: "issue7_fixture",
  id: entry.reference_id || randomUUID(),
};
entry.reference_id = reference.id;
writeFileSync(path, JSON.stringify(manifest, null, 2));
try {
  const authorize = async () => {
    if (manifest.owner_id !== owner.id || reference.type !== "issue7_fixture")
      throw Error("Fixture domain guard");
  };
  const published = await publishMedia(client, entry.id, reference, authorize);
  assert.deepEqual(
    await publishMedia(client, entry.id, reference, authorize),
    published,
    "publication retry",
  );
  const row = JSON.parse(
    psql(
      `select to_jsonb(i) from private.upload_intents i where id='${entry.id}'::uuid;`,
    ).trim(),
  );
  entry.published_asset_id = row.published_asset_id;
  entry.published_public_id = row.published_public_id;
  writeFileSync(path, JSON.stringify(manifest, null, 2));
  const sample = {
    ...published,
    width: published.width!,
    height: published.height!,
  };
  const metrics = [];
  for (const [width, budget] of [
    [160, 50000],
    [600, 150000],
    [1200, 300000],
  ]) {
    const result = await fetch(publicImageUrl(sample, width), {
      headers: { Accept: "image/avif,image/webp,image/*" },
    });
    assert.equal(result.status, 200);
    const bytes = (await result.arrayBuffer()).byteLength;
    assert.ok(bytes < budget, "synthetic sample budget");
    metrics.push({
      width,
      bytes,
      budget,
      type: result.headers.get("content-type"),
    });
  }
  const original = cloud().url(row.public_id, {
    secure: true,
    type: "authenticated",
    version: row.version,
    format: row.format,
    sign_url: true,
    transformation: [{ width: 100, crop: "limit" }],
  });
  assert.ok(
    [401, 403, 404].includes((await fetch(original)).status),
    "signed derivative remains blocked",
  );
  console.log(
    JSON.stringify({
      publication: "PASS",
      retry: "same-asset",
      original: "protected",
      sample: "synthetic poster; not final organization artwork",
      metrics,
    }),
  );
} finally {
  await client.auth.signOut({ scope: "local" });
}
