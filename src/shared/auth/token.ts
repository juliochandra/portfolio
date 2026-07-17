import jwt from "jsonwebtoken";
import { env } from "@/shared/env";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export type AuthSession = {
	userId: string;
	username: string;
};

type TokenType = "access" | "refresh";

function getSecret(tokenType: TokenType): string {
	return tokenType === "access" ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET;
}

function getTtl(tokenType: TokenType): number {
	return tokenType === "access" ? ACCESS_TOKEN_TTL_SECONDS : REFRESH_TOKEN_TTL_SECONDS;
}

function signToken(session: AuthSession, tokenType: TokenType): string {
	return jwt.sign({ tokenType, username: session.username }, getSecret(tokenType), {
		algorithm: "HS256",
		expiresIn: getTtl(tokenType),
		subject: session.userId,
	});
}

function verifyToken(
	token: string | undefined,
	expectedType: TokenType,
	nowInSeconds = Math.floor(Date.now() / 1000),
): AuthSession | null {
	if (!token) {
		return null;
	}

	try {
		const decoded = jwt.verify(token, getSecret(expectedType), {
			algorithms: ["HS256"],
			clockTimestamp: nowInSeconds,
			complete: true,
		});
		const payload = decoded.payload;
		if (
			decoded.header.typ !== "JWT" ||
			typeof payload === "string" ||
			payload.tokenType !== expectedType ||
			typeof payload.exp !== "number" ||
			typeof payload.iat !== "number" ||
			payload.iat > nowInSeconds ||
			typeof payload.sub !== "string" ||
			payload.sub.length === 0 ||
			typeof payload.username !== "string" ||
			payload.username.length === 0
		) {
			return null;
		}

		return { userId: payload.sub, username: payload.username };
	} catch {
		return null;
	}
}

export function signAccessToken(session: AuthSession): Promise<string> {
	return Promise.resolve(signToken(session, "access"));
}

export function signRefreshToken(session: AuthSession): Promise<string> {
	return Promise.resolve(signToken(session, "refresh"));
}

export function verifyAccessToken(token: string | undefined): Promise<AuthSession | null> {
	return Promise.resolve(verifyToken(token, "access"));
}

export function verifyRefreshToken(token: string | undefined): Promise<AuthSession | null> {
	return Promise.resolve(verifyToken(token, "refresh"));
}
