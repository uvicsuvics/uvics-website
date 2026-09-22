import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("public image component delivers responsive lazy media on a mobile network sample", async ({
  page,
  context,
}) => {
  test.skip(
    !process.env.PUBLIC_MEDIA_SAMPLE,
    "Explicit published synthetic sample required.",
  );
  const html = readFileSync(".runtime/public-media-sample.html", "utf8");
  await page.setViewportSize({ width: 390, height: 844 });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: 200000,
    uploadThroughput: 93750,
  });
  await page.goto("data:text/html," + encodeURIComponent(html));
  const hero = page.getByAltText("Synthetic blue poster");
  await expect(hero).toBeVisible();
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(page.getByAltText("Synthetic lazy poster")).toHaveAttribute(
    "loading",
    "lazy",
  );
  expect(
    await hero.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
    ),
  ).toBe(true);
  expect(await hero.getAttribute("srcset")).toContain("q_auto,f_auto");
  expect(
    await hero.evaluate((img: HTMLImageElement) => img.currentSrc),
  ).not.toContain("/_next/image");
  const lcp = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          observer.disconnect();
          resolve(entries.at(-1)!.startTime);
        });
        observer.observe({ type: "largest-contentful-paint", buffered: true });
      }),
  );
  console.log(
    JSON.stringify({
      sample: "synthetic poster",
      viewport: 390,
      latency_ms: 150,
      download_bytes_second: 200000,
      lcp_ms: Math.round(lcp),
    }),
  );
  await page.screenshot({ path: ".runtime/media-mobile.png" });
});
