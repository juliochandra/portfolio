import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from "./token";

export const ACCESS_TOKEN_COOKIE = "admin_access_token";
export const REFRESH_TOKEN_COOKIE = "admin_refresh_token";

type SessionCookieOptions = {
	httpOnly: true;
	maxAge: number;
	path: "/";
	sameSite: "lax";
	secure: boolean;
};

function sessionCookieOptions(maxAge: number): SessionCookieOptions {
	return {
		httpOnly: true,
		maxAge,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	};
}

export function accessCookieOptions(): SessionCookieOptions {
	return sessionCookieOptions(ACCESS_TOKEN_TTL_SECONDS);
}

export function refreshCookieOptions(): SessionCookieOptions {
	return sessionCookieOptions(REFRESH_TOKEN_TTL_SECONDS);
}

export function expiredCookieOptions(): SessionCookieOptions {
	return sessionCookieOptions(0);
}
