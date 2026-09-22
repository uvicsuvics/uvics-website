import { test, expect } from "@playwright/test";
import { authFixtures } from "../fixtures";
test("guest routes, form validation, and responsive public/admin shells", async ({
  page,
}) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(
    page.getByRole("heading", { name: "Login Admin" }),
  ).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(
    page.getByText("Masukkan alamat email yang valid."),
  ).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: ".runtime/login-mobile.png" });
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/dashboard/settings");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/");
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Uvics Logo" })).toBeVisible();
});
test("origin/method/content type guards precede media effects", async ({
  request,
}) => {
  for (const origin of [
    undefined,
    "null",
    "https://foreign.invalid",
    "http://sub.localhost:3000",
  ]) {
    const response = await request.post("/api/admin/media/signature", {
      headers: origin ? { Origin: origin } : {},
      data: { category: "profile", kind: "image" },
    });
    expect(response.status()).toBe(403);
  }
  const origin = process.env.TEST_APP_URL || "http://localhost:3000";
  const invalid = await request.post("/api/admin/media/signature", {
    headers: { Origin: origin, "Content-Type": "text/plain" },
    data: "{}",
  });
  expect(invalid.status()).toBe(422);
  const guest = await request.post("/api/admin/media/signature", {
    headers: { Origin: origin },
    data: { category: "profile", kind: "image" },
  });
  expect(guest.status()).toBe(401);
  expect(guest.headers()["cache-control"]).toContain("no-store");
  expect((await request.get("/api/admin/media/signature")).status()).toBe(405);
});
test("real admin login, generic failure, cookies and current-session logout", async ({
  page,
  context,
}) => {
  test.skip(
    process.env.RUN_HOSTED_TESTS !== "1",
    "Explicit pre-go-live hosted test only; guest tests still run in CI.",
  );
  const manifest = authFixtures();
  const account = manifest.users.find((u) => u.label === "admin");
  if (!account) throw Error("Create recorded synthetic fixture first");
  await page.goto("/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "Email atau password tidak valid.",
  );
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
    account.email,
  );
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Dashboard Admin" }),
  ).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  const cookies = await context.cookies();
  const auth = cookies.filter((c) => c.name.startsWith("sb-"));
  expect(auth.length).toBeGreaterThan(0);
  expect(auth.every((c) => c.sameSite === "Lax" && c.path === "/")).toBe(true);
  const https = process.env.TEST_APP_URL === "https://localhost:3000";
  expect(
    auth.every((c) => c.secure === https && c.domain === "localhost"),
  ).toBe(true);
  await page.screenshot({ path: ".runtime/dashboard-desktop.png" });
  if (https) {
    const blob = auth
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => c.value)
      .join("");
    const session = JSON.parse(
      Buffer.from(blob.slice("base64-".length), "base64url").toString(),
    );
    const originalId = JSON.parse(
      Buffer.from(session.access_token.split(".")[1], "base64url").toString(),
    ).session_id;
    session.expires_at = 1; // Only the synthetic browser's refresh hint; no server clock/Auth row changes.
    const encoded =
      "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url");
    const baseName = auth[0].name.replace(/\.\d+$/, "");
    await context.clearCookies({ name: /^sb-/ });
    const chunks = encoded.match(/.{1,3000}/g)!;
    await context.addCookies(
      chunks.map((value, index) => ({
        ...auth[0],
        name: chunks.length === 1 ? baseName : `${baseName}.${index}`,
        value,
      })),
    );
    const refreshed = await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    expect(refreshed!.headers()["cache-control"]).toContain("no-store");
    const setCookies = (await refreshed!.headersArray()).filter(
      (h) => h.name.toLowerCase() === "set-cookie",
    );
    expect(setCookies.length).toBeGreaterThan(0);
    expect(
      setCookies.every(
        (h) =>
          /Secure/i.test(h.value) &&
          /SameSite=lax/i.test(h.value) &&
          /Path=\//i.test(h.value) &&
          !/(?:^|;)\s*Domain=/i.test(h.value),
      ),
    ).toBe(true);
    const refreshedBlob = (await context.cookies())
      .filter((c) => c.name.startsWith("sb-"))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => c.value)
      .join("");
    const renewed = JSON.parse(
      Buffer.from(refreshedBlob.slice(7), "base64url").toString(),
    );
    expect(renewed.expires_at).toBeGreaterThan(1);
    expect(
      JSON.parse(
        Buffer.from(renewed.access_token.split(".")[1], "base64url").toString(),
      ).session_id,
    ).toBe(originalId);
  }
  await page.goto("/admin/login");
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await page.getByRole("button", { name: "Keluar dari sesi ini" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
