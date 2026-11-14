import { defineConfig, devices } from "@playwright/test";

// Runs the production build against the scripted mock model, so no provider key is needed.
const PORT = 3105;
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { ...devices["Desktop Chrome"], baseURL: `http://127.0.0.1:${PORT}` },
  webServer: {
    command: `npx next start -p ${PORT} -H 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    env: { LENS_MOCK_LLM: "1", LENS_MODELS: "mock:scripted=Scripted test model,mock:exhausted=Out-of-quota test model" },
  },
});
