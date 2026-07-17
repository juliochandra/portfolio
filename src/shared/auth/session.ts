import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "./token";

export type SessionTokens = {
	accessToken: string;
	refreshToken: string;
};

export type ResolvedSession = {
	accessToken?: string;
	session: {
		userId: string;
		username: string;
	};
};

export async function createSessionTokens(session: {
	userId: string;
	username: string;
}): Promise<SessionTokens> {
	const [accessToken, refreshToken] = await Promise.all([
		signAccessToken(session),
		signRefreshToken(session),
	]);

	return { accessToken, refreshToken };
}

export async function resolveSessionTokens(tokens: {
	accessToken?: string;
	refreshToken?: string;
}): Promise<ResolvedSession | null> {
	const accessSession = await verifyAccessToken(tokens.accessToken);
	if (accessSession) {
		return { session: accessSession };
	}

	const refreshSession = await verifyRefreshToken(tokens.refreshToken);
	if (!refreshSession) {
		return null;
	}

	return {
		accessToken: await signAccessToken(refreshSession),
		session: refreshSession,
	};
}
