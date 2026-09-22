import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  retries: 0,
  reporter: "list",
  webServer: process.env.CI
    ? {
        command: "npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: false,
        timeout: 60000,
      }
    : undefined,
  use: {
    baseURL: process.env.TEST_APP_URL || "http://localhost:3000",
    trace: "off",
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: process.env.TEST_APP_URL === "https://localhost:3000",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.CI ? "chromium" : "chrome",
      },
    },
  ],
});
