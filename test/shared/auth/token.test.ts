import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveSessionTokens } from "@/shared/auth/session";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/shared/auth/token";

describe("JWT auth tokens", () => {
	const originalEnv = process.env;
	const session = { userId: "user-1", username: "admin" };

	beforeEach(() => {
		process.env = {
			...originalEnv,
			JWT_ACCESS_SECRET: "test-access-secret-with-sufficient-entropy",
			JWT_REFRESH_SECRET: "test-refresh-secret-with-sufficient-entropy",
		};
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-07-17T00:00:00.000Z"));
	});

	afterEach(() => {
		process.env = originalEnv;
		vi.useRealTimers();
	});

	it("signs and verifies access and refresh tokens with separate types", async () => {
		const accessToken = await signAccessToken(session);
		const refreshToken = await signRefreshToken(session);

		await expect(verifyAccessToken(accessToken)).resolves.toEqual(session);
		await expect(verifyRefreshToken(refreshToken)).resolves.toEqual(session);
		await expect(verifyAccessToken(refreshToken)).resolves.toBeNull();
		await expect(verifyRefreshToken(accessToken)).resolves.toBeNull();
	});

	it("rejects a token whose signature was changed", async () => {
		const accessToken = await signAccessToken(session);
		const tampered = `${accessToken.slice(0, -1)}${accessToken.endsWith("a") ? "b" : "a"}`;

		await expect(verifyAccessToken(tampered)).resolves.toBeNull();
	});

	it("uses a valid refresh token to replace an expired access token", async () => {
		const accessToken = await signAccessToken(session);
		const refreshToken = await signRefreshToken(session);
		vi.setSystemTime(new Date("2026-07-17T00:16:00.000Z"));

		const resolved = await resolveSessionTokens({ accessToken, refreshToken });

		expect(resolved?.session).toEqual(session);
		expect(resolved?.accessToken).toEqual(expect.any(String));
		await expect(verifyAccessToken(resolved?.accessToken)).resolves.toEqual(session);
	});

	it("rejects the session after the refresh token expires", async () => {
		const refreshToken = await signRefreshToken(session);
		vi.setSystemTime(new Date("2026-07-24T00:00:01.000Z"));

		await expect(resolveSessionTokens({ refreshToken })).resolves.toBeNull();
	});
});
