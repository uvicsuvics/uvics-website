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
