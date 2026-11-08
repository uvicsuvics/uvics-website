import { test, expect } from "@playwright/test";

for (const width of [390, 1280]) {
  test(`public navigation, images and batch query state at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Uvics Logo" })).toBeVisible();
    if (width < 1024) {
      const toggle = page.getByRole("button", { name: "Buka navigasi" });
      await toggle.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#mobile-navigation")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator("#mobile-navigation")).toHaveCount(0);
      await expect(toggle).toBeFocused();
    }
    await page
      .getByRole("heading", { name: "Our Memorable Moments" })
      .scrollIntoViewIfNeeded();
    const galleryImage = page.locator('img[alt^="UVICS Activity"]').first();
    await expect(galleryImage).toBeVisible();
    await expect
      .poll(() =>
        galleryImage.evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `.runtime/gallery-${width}.png` });

    await page.goto("/batch?year=2024");
    await expect(
      page.getByText("Chapter 2024", { exact: false }),
    ).toBeVisible();
    const all = page.getByRole("button", { name: "Semua Bidang", exact: true });
    await all.locator("..").getByRole("button").nth(1).click();
    await expect(all).toHaveAttribute("aria-pressed", "false");
    // History API memicu perubahan search params tanpa remount seluruh halaman.
    await page.evaluate(() =>
      window.history.pushState(null, "", "/batch?year=2023"),
    );
    await expect(
      page.getByText("Chapter 2023", { exact: false }),
    ).toBeVisible();
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await page.goBack();
    await expect(
      page.getByText("Chapter 2024", { exact: false }),
    ).toBeVisible();
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from(document.images)
            .filter(
              (image) =>
                image.getBoundingClientRect().top < innerHeight &&
                image.getBoundingClientRect().bottom > 0,
            )
            .every((image) => image.complete && image.naturalWidth > 0),
        ),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `.runtime/batch-${width}.png` });
    expect(errors).toEqual([]);
  });
}

const PROFILE_PAGES = [
  { path: "/about", title: "Tentang UVICS" },
  { path: "/vision-mission", title: "Visi & Misi | UVICS" },
  { path: "/programs", title: "Program | UVICS" },
  { path: "/programs/mentor-community", title: "Mentor Community | Program UVICS" },
  { path: "/departments", title: "Departemen | UVICS" },
  { path: "/departments/web-development", title: "Web Development | Departemen UVICS" },
  { path: "/organization", title: "Struktur Organisasi | UVICS" },
  { path: "/achievements", title: "Prestasi | UVICS" },
  {
    path: "/achievements/juara-1-national-ai-hackathon-2026",
    title: "Juara 1 & Best Technical Innovation | Prestasi UVICS",
  },
  { path: "/competitions", title: "Kompetisi & Kejuaraan | UVICS UNKLAB" },
  {
    path: "/competitions/gemastik-xviii-pengembangan-aplikasi",
    title: "Gemastik XVIII - Divisi Pengembangan Aplikasi | Kompetisi UVICS UNKLAB",
  },
  { path: "/events", title: "Event | UVICS" },
  { path: "/events/contoh-webinar-uvics-vibes", title: "Contoh: Webinar UVICS Vibes | Event UVICS" },
  { path: "/news", title: "Berita | UVICS" },
  {
    path: "/news/contoh-rangkuman-webinar-uvics-vibes",
    title: "Contoh: Rangkuman Webinar UVICS Vibes | Berita UVICS",
  },
  { path: "/projects", title: "Project | UVICS" },
  {
    path: "/projects/klabat-campus-superapp",
    title: "Klabat Campus SuperApp & Academic Portal | Project UVICS",
  },
];

for (const { path, title } of PROFILE_PAGES) {
  for (const width of [390, 1280]) {
    test(`${path} keeps its hero below the fixed navbar at ${width}px`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      const navBottom = await page
        .locator("header, nav")
        .first()
        .evaluate((element) => element.getBoundingClientRect().bottom);
      // Teks pertama hero (badge/eyebrow) yang dulu tertutup navbar fixed.
      const firstText = page.locator("main").locator("h1, p, span").first();
      expect((await firstText.boundingBox())?.y).toBeGreaterThan(navBottom);
      await expect(page.locator('a[href="/vision-mission"]').first()).toBeAttached();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test("public navigation: /join shows closed registration when settings are unavailable", async ({
  page,
}) => {
  await page.goto("/join");
  await expect(
    page.getByRole("heading", { level: 1, name: "Join UVICS" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Pendaftaran sedang ditutup. Ikuti media sosial UVICS untuk informasi rekrutmen berikutnya.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "NIM" })).toHaveCount(0);
});

test("public navigation: /competitions keeps filter state in the URL", async ({ page }) => {
  await page.goto("/competitions?level=NASIONAL");
  const search = page.getByRole("textbox", { name: "Cari kompetisi atau penyelenggara" });
  await search.pressSequentially("hack", { delay: 20 });
  await expect(page).toHaveURL(/search=hack(?!athon)/);
  await search.pressSequentially("athon", { delay: 20 });
  await expect(search).toHaveValue("hackathon");
  await expect(page).toHaveURL(/search=hackathon/);
  await expect(page).toHaveURL(/level=NASIONAL/);
  await page.getByRole("radio", { name: /Pendaftaran Dibuka/ }).check();
  await expect(page).toHaveURL(/status=OPEN/);
  await expect(search).toHaveValue("hackathon");
  await expect(page.getByRole("heading", { level: 2, name: "Pendaftaran Dibuka" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Segera Dibuka" })).toHaveCount(0);
  expect((await page.goto("/competitions?status=foo&level=bar&category=zzz"))?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 2, name: "Pendaftaran Dibuka" })).toBeVisible();
});

test("public navigation: unknown competition renders the public not-found page", async ({ page }) => {
  // Status is a streamed 200 because competitions/loading.tsx exists; noindex marks the not-found.
  await page.goto("/competitions/tidak-ada");
  await expect(page.locator('meta[name="robots"][content="noindex"]').first()).toBeAttached();
  await expect(page.getByRole("heading", { level: 1, name: "Halaman tidak ditemukan" })).toBeVisible();
  await expect(page.locator('a[href="/vision-mission"]').first()).toBeAttached();
});

test("public navigation: unknown achievement and project return a real 404", async ({ page }) => {
  for (const path of ["/achievements/tidak-ada", "/projects/tidak-ada"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Halaman tidak ditemukan" })).toBeVisible();
  }
});

test("public navigation: unknown event and news slugs return a real 404", async ({ page }) => {
  for (const path of ["/events/tidak-ada", "/news/tidak-ada"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Halaman tidak ditemukan" })).toBeVisible();
  }
});

test("public navigation: events and news listings handle page and search params", async ({ page }) => {
  expect((await page.goto("/events?page=abc"))?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 2, name: "Akan datang" })).toBeVisible();
  // Listing memakai loading.tsx, jadi halaman di luar total menjadi not-found ber-noindex (streamed 200).
  await page.goto("/news?page=99");
  await expect(page.locator('meta[name="robots"][content="noindex"]').first()).toBeAttached();
  await expect(page.getByRole("heading", { level: 1, name: "Halaman tidak ditemukan" })).toBeVisible();

  await page.goto("/news");
  await page.getByRole("searchbox", { name: "Cari berita" }).fill("devhub");
  await page.getByRole("button", { name: "Cari" }).click();
  await expect(page).toHaveURL(/\/news\?search=devhub/);
  await expect(page.getByRole("link", { name: "Contoh: Catatan Kelas DevHub" })).toBeVisible();
});

test("public navigation: /blog redirects to /news", async ({ page, request }) => {
  const response = await request.get("/blog/contoh-catatan-kelas-devhub", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toMatch(/\/news\/contoh-catatan-kelas-devhub$/);
  await page.goto("/blog");
  await expect(page).toHaveURL(/\/news$/);
});

test("public navigation: homepage event and news links open their detail pages", async ({ page, request }) => {
  await page.goto("/");
  for (const prefix of ["/events/", "/news/"]) {
    const href = await page.locator(`main a[href^="${prefix}"]`).first().getAttribute("href");
    expect(href).toBeTruthy();
    expect((await request.get(href!)).status()).toBe(200);
  }
});
