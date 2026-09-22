import { test, expect, type Page } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { authFixtures } from "../fixtures";

const fixtures = authFixtures;
const signatureSchema = z.object({
  intent_id: z.uuid(),
  upload_url: z.url(),
  api_key: z.string(),
  signature: z.string(),
  params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  expires_at: z.string(),
});
async function login(page: Page, label: string) {
  const user = fixtures().users.find((u) => u.label === label)!;
  await page.goto("/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

test("hosted upload, protected delivery, immutable replay and completion ownership", async ({
  page,
  browser,
  request,
}) => {
  test.skip(
    process.env.RUN_HOSTED_TESTS !== "1",
    "Controlled hosted fixture only.",
  );
  test.setTimeout(180000);
  const origin = process.env.TEST_APP_URL || "http://localhost:3000";
  const manifest = {
    run_id: randomUUID(),
    owner_id: fixtures().users.find((u) => u.label === "admin")!.id,
    intents: [] as {
      id: string;
      public_id: string;
      cleanup_not_before: string;
      asset_id?: string;
      version?: number;
      category: string;
    }[],
  };
  const path = `.runtime/media-${manifest.run_id}.json`;
  const save = () => writeFileSync(path, JSON.stringify(manifest, null, 2));
  save();
  await login(page, "admin");
  const png = await sharp(
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#0230a7"/><circle cx="920" cy="330" r="200" fill="#ffd000"/><path d="M0 650L700 200L1200 800H0" fill="#0066ff"/><text x="80" y="180" font-size="76" fill="white">UVICS synthetic poster</text><text x="80" y="720" font-size="42" fill="white">Rendering test - not organization content</text></svg>',
    ),
  )
    .png()
    .toBuffer();
  const alternate = await sharp({
    create: { width: 60, height: 40, channels: 3, background: "#ffd000" },
  })
    .png()
    .toBuffer();
  async function intent(category: string, kind: string) {
    const response = await page.request.post("/api/admin/media/signature", {
      headers: { Origin: origin },
      data: { category, kind },
    });
    expect(response.status()).toBe(201);
    const signed = signatureSchema.parse((await response.json()).data);
    manifest.intents.push({
      id: signed.intent_id,
      public_id: String(signed.params.public_id),
      cleanup_not_before: new Date(
        Date.parse(signed.expires_at) + 300000,
      ).toISOString(),
      category,
    });
    save();
    return signed;
  }
  async function upload(
    signed: z.infer<typeof signatureSchema>,
    file: Buffer,
    overrides: Record<string, string> = {},
    url = signed.upload_url,
  ) {
    return request.post(url, {
      multipart: {
        ...Object.fromEntries(
          Object.entries(signed.params).map(([k, v]) => [k, String(v)]),
        ),
        api_key: signed.api_key,
        signature: signed.signature,
        ...overrides,
        file: {
          name: "synthetic.bin",
          mimeType: "application/octet-stream",
          buffer: file,
        },
      },
    });
  }
  const signed = await intent("poster", "image");
  const uploaded = await upload(signed, png);
  expect(uploaded.status()).toBe(200);
  const asset = z
    .object({
      asset_id: z.string(),
      version: z.number(),
      public_id: z.string(),
      secure_url: z.url(),
    })
    .parse(await uploaded.json());
  Object.assign(manifest.intents[0], {
    asset_id: asset.asset_id,
    version: asset.version,
  });
  save();
  for (const url of [
    asset.secure_url,
    asset.secure_url
      .replace(/s--[^/]+--[/]/, "")
      .replace("/authenticated/", "/authenticated/w_100/"),
  ]) {
    expect([401, 403, 404]).toContain((await request.get(url)).status());
  }
  const replayBefore = await upload(signed, alternate);
  expect(replayBefore.status()).toBe(200);
  expect((await replayBefore.json()).asset_id).toBe(asset.asset_id);
  const complete = {
    intent_id: signed.intent_id,
    asset_id: asset.asset_id,
    version: asset.version,
  };
  const completions = await Promise.all(
    [1, 2].map(() =>
      page.request.post("/api/admin/media/complete", {
        headers: { Origin: origin },
        data: complete,
      }),
    ),
  );
  expect(completions.map((r) => r.status())).toEqual([200, 200]);
  expect((await completions[0].json()).data).toEqual(
    (await completions[1].json()).data,
  );
  expect(
    (
      await page.request.post("/api/admin/media/complete", {
        headers: { Origin: origin },
        data: { ...complete, asset_id: "forged" },
      })
    ).status(),
  ).toBe(409);
  const privateFile = await page.request.get(
    `/api/admin/media/${signed.intent_id}`,
  );
  expect(privateFile.status()).toBe(200);
  expect(privateFile.headers()["cache-control"]).toContain("no-store");
  expect(await privateFile.body()).toEqual(png);
  expect(
    (await request.get(`/api/admin/media/${signed.intent_id}`)).status(),
  ).toBe(401);
  const replayAfter = await upload(signed, alternate);
  expect(replayAfter.status()).toBe(200);
  expect((await replayAfter.json()).asset_id).toBe(asset.asset_id);
  expect(
    await (
      await page.request.get(`/api/admin/media/${signed.intent_id}`)
    ).body(),
  ).toEqual(png);
  const tampered: Record<string, string>[] = [
    { public_id: `${signed.params.public_id}-tampered` },
    { upload_preset: "uvics_image_2mb_v1" },
    { overwrite: "true" },
  ];
  for (const change of tampered) {
    expect([400, 401]).toContain((await upload(signed, png, change)).status());
  }
  // Resource type is not signed: provider rejection or private-only alternate namespace is valid; completion must use expected image namespace.
  const wrongNamespace = await intent("profile", "image");
  const rawUpload = await upload(
    wrongNamespace,
    png,
    {},
    wrongNamespace.upload_url.replace("/image/", "/raw/"),
  );
  if (rawUpload.status() === 200) {
    const raw = await rawUpload.json();
    expect([404, 422]).toContain(
      (
        await page.request.post("/api/admin/media/complete", {
          headers: { Origin: origin },
          data: {
            intent_id: wrongNamespace.intent_id,
            asset_id: raw.asset_id,
            version: raw.version,
          },
        })
      ).status(),
    );
  } else expect([400, 401]).toContain(rawUpload.status());
  const second = await browser.newContext();
  const secondPage = await second.newPage();
  await login(secondPage, "other-admin");
  expect(
    (
      await secondPage.request.post("/api/admin/media/complete", {
        headers: { Origin: origin },
        data: complete,
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await secondPage.request.get(`/api/admin/media/${signed.intent_id}`)
    ).status(),
  ).toBe(404);
  await secondPage
    .getByRole("button", { name: "Keluar dari sesi ini" })
    .click();
  await expect(secondPage).toHaveURL(/\/admin\/login$/);
  await second.close();
  const pdfIntent = await intent("document", "pdf");
  const pdf = Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 100 100]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF",
  );
  const pdfUpload = await upload(pdfIntent, pdf);
  expect(pdfUpload.status()).toBe(200);
  const pdfAsset = await pdfUpload.json();
  Object.assign(manifest.intents.at(-1)!, {
    asset_id: pdfAsset.asset_id,
    version: pdfAsset.version,
  });
  save();
  expect(
    (
      await page.request.post("/api/admin/media/complete", {
        headers: { Origin: origin },
        data: {
          intent_id: pdfIntent.intent_id,
          asset_id: pdfAsset.asset_id,
          version: pdfAsset.version,
        },
      })
    ).status(),
  ).toBe(200);
  const pdfDownload = await page.request.get(
    `/api/admin/media/${pdfIntent.intent_id}`,
  );
  expect(pdfDownload.status()).toBe(200);
  expect((await pdfDownload.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await page.getByRole("button", { name: "Keluar dari sesi ini" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(
    (
      await page.request.post("/api/admin/media/complete", {
        headers: { Origin: origin },
        data: complete,
      })
    ).status(),
  ).toBe(401);
  console.log(`Media fixture manifest: ${path}`);
});
