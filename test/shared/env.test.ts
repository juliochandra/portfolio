/** biome-ignore-all lint/style/useNamingConvention: <env> */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("env", () => {
	const originalEnv = process.env;
	const validEnv = {
		ADMIN_PASSWORD: "test-admin-password",
		ADMIN_USERNAME: "admin",
		// biome-ignore lint/nursery/noSecrets: test fixture, not a real credential
		DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
		JWT_ACCESS_SECRET: "test-access-secret-with-sufficient-entropy",
		JWT_REFRESH_SECRET: "test-refresh-secret-with-sufficient-entropy",
		R2_ACCOUNT_ID: "test-account-id",
		R2_ACCESS_KEY_ID: "test-access-key-id",
		R2_SECRET_ACCESS_KEY: "test-secret-access-key",
		R2_BUCKET_NAME: "test-bucket",
		R2_PUBLIC_URL: "https://pub-test.r2.dev",
	};

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("parses a valid env", async () => {
		Object.assign(process.env, validEnv);
		const { env } = await import("@/shared/env");
		expect(env).toMatchObject(validEnv);
	});

	it.each(Object.keys(validEnv) as (keyof typeof validEnv)[])("throws when %s is missing", async (name) => {
		Object.assign(process.env, validEnv);
		delete process.env[name];
		await expect(import("@/shared/env")).rejects.toThrow();
	});
});
