/** biome-ignore-all lint/style/useNamingConvention: <test> */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: "html",
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		// biome-ignore lint/nursery/noSecrets: Command only clears generated build output before the E2E server starts.
		command: "node -e \"require('fs').rmSync('.next', { recursive: true, force: true })\" && npm run build && npm run start",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
