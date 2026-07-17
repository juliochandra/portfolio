import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { middleware } from "@/middleware";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/shared/auth/cookies";
import { createSessionTokens } from "@/shared/auth/session";

describe("admin auth middleware", () => {
	beforeEach(() => {
		process.env.JWT_ACCESS_SECRET = "test-access-secret-with-sufficient-entropy";
		process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-sufficient-entropy";
	});

	it("redirects an unauthenticated admin request to login", async () => {
		const response = await middleware(new NextRequest("https://example.com/admin"));

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toBe("https://example.com/login");
	});

	it("allows an admin request with a valid access token", async () => {
		const tokens = await createSessionTokens({
			userId: "user-1",
			username: "admin",
		});
		const request = new NextRequest("https://example.com/admin/projects", {
			headers: { cookie: `${ACCESS_TOKEN_COOKIE}=${tokens.accessToken}` },
		});

		const response = await middleware(request);

		expect(response.status).toBe(200);
		expect(response.headers.get("x-middleware-next")).toBe("1");
	});

	it("issues a new access cookie from a valid refresh token", async () => {
		const tokens = await createSessionTokens({
			userId: "user-1",
			username: "admin",
		});
		const request = new NextRequest("https://example.com/admin", {
			headers: { cookie: `${REFRESH_TOKEN_COOKIE}=${tokens.refreshToken}` },
		});

		const response = await middleware(request);

		expect(response.status).toBe(200);
		expect(response.cookies.get(ACCESS_TOKEN_COOKIE)?.value).toEqual(expect.any(String));
	});
});
