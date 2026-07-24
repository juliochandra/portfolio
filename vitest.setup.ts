/** biome-ignore-all lint/nursery/noSecrets: isolated test fixtures */
import "@testing-library/jest-dom/vitest";

Object.assign(process.env, {
	ADMIN_PASSWORD: "test-admin-password",
	ADMIN_USERNAME: "admin",
	DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
	JWT_ACCESS_SECRET: "test-access-secret-with-sufficient-entropy",
	JWT_REFRESH_SECRET: "test-refresh-secret-with-sufficient-entropy",
	R2_PUBLIC_URL: "https://pub-test.r2.dev",
});
