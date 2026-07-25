import "dotenv/config";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		setupFiles: ["@testing-library/jest-dom/vitest"],
		include: ["test/**/*.test.{ts,tsx}"],
		exclude: ["**/e2e/**"],
		env: {
			ADMIN_PASSWORD: "test-admin-password",
			ADMIN_USERNAME: "admin",
			JWT_ACCESS_SECRET: "test-access-secret-with-sufficient-entropy",
			JWT_REFRESH_SECRET: "test-refresh-secret-with-sufficient-entropy",
			R2_PUBLIC_URL: "https://pub-test.r2.dev",
		},
	},
	resolve: {
		alias: {
			"@": new URL("./src", import.meta.url).pathname,
		},
	},
});
