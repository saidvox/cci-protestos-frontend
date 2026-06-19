import { defineConfig, devices } from "@playwright/test"
export default defineConfig({ testDir: "./e2e", fullyParallel: true, retries: process.env.CI ? 2 : 0, reporter: "html", use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173", trace: "on-first-retry" }, projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }], webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : { command: "npm run dev -- --mode e2e --host 127.0.0.1", url: "http://127.0.0.1:5173", reuseExistingServer: !process.env.CI } })

