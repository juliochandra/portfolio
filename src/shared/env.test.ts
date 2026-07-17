/** biome-ignore-all lint/style/useNamingConvention: <env> */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("env", () => {
  const originalEnv = process.env;
  const validEnv = {
    // biome-ignore lint/nursery/noSecrets: test fixture, not a real credential
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
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
    const { env } = await import("./env");
    expect(env).toMatchObject(validEnv);
  });

  it("throws when DATABASE_URL is missing", async () => {
    Object.assign(process.env, validEnv);
    delete process.env.DATABASE_URL;
    await expect(import("./env")).rejects.toThrow();
  });

  it("throws when R2_ACCOUNT_ID is missing", async () => {
    Object.assign(process.env, validEnv);
    delete process.env.R2_ACCOUNT_ID;
    await expect(import("./env")).rejects.toThrow();
  });
});
