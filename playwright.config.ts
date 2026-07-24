/** biome-ignore-all lint/style/useNamingConvention: <test> */
import { defineConfig, devices } from "@playwright/test";

const e2ePort = 3001;
const e2eBaseUrl = `http://localhost:${e2ePort}`;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: "html",
	use: {
		baseURL: e2eBaseUrl,
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command:
			// biome-ignore lint/nursery/noSecrets: Command only clears the isolated E2E build output before the E2E server starts.
			"set \"NEXT_DIST_DIR=.next-e2e\" && node -e \"require('fs').rmSync('.next-e2e', { recursive: true, force: true })\" && npm run build && npm run start -- -p 3001",
		url: e2eBaseUrl,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
