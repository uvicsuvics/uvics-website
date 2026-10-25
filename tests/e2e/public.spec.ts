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
  { path: "/departments", title: "Departemen | UVICS" },
  { path: "/departments/software-engineering", title: "Software Engineering | Departemen UVICS" },
  { path: "/organization", title: "Struktur Organisasi | UVICS" },
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
