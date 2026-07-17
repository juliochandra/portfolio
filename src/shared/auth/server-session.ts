import { cookies } from "next/headers";
import {
	ACCESS_TOKEN_COOKIE,
	accessCookieOptions,
	expiredCookieOptions,
	REFRESH_TOKEN_COOKIE,
	refreshCookieOptions,
} from "./cookies";
import { createSessionTokens, resolveSessionTokens } from "./session";
import type { AuthSession } from "./token";

export async function setServerSession(session: AuthSession): Promise<void> {
	const cookieStore = await cookies();
	const tokens = await createSessionTokens(session);
	cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, accessCookieOptions());
	cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, refreshCookieOptions());
}

export async function getServerSession(): Promise<AuthSession | null> {
	const cookieStore = await cookies();
	const resolved = await resolveSessionTokens({
		accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
		refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
	});
	if (!resolved) {
		return null;
	}

	if (resolved.accessToken) {
		cookieStore.set(ACCESS_TOKEN_COOKIE, resolved.accessToken, accessCookieOptions());
	}

	return resolved.session;
}

export async function clearServerSession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(ACCESS_TOKEN_COOKIE, "", expiredCookieOptions());
	cookieStore.set(REFRESH_TOKEN_COOKIE, "", expiredCookieOptions());
}
