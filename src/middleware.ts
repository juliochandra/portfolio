import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, accessCookieOptions, expiredCookieOptions, REFRESH_TOKEN_COOKIE } from "@/shared/auth/cookies";
import { resolveSessionTokens } from "@/shared/auth/session";

export async function middleware(request: NextRequest): Promise<NextResponse> {
	const resolved = await resolveSessionTokens({
		accessToken: request.cookies.get(ACCESS_TOKEN_COOKIE)?.value,
		refreshToken: request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
	});

	if (!resolved) {
		const response = NextResponse.redirect(new URL("/login", request.url));
		response.cookies.set(ACCESS_TOKEN_COOKIE, "", expiredCookieOptions());
		response.cookies.set(REFRESH_TOKEN_COOKIE, "", expiredCookieOptions());
		return response;
	}

	const response = NextResponse.next();
	if (resolved.accessToken) {
		response.cookies.set(ACCESS_TOKEN_COOKIE, resolved.accessToken, accessCookieOptions());
	}

	return response;
}

export const config = {
	matcher: ["/admin/:path*"],
	runtime: "nodejs",
};
