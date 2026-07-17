import { env } from "@/shared/env";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export type AuthSession = {
	userId: string;
	username: string;
};

type TokenType = "access" | "refresh";

type TokenPayload = {
	exp: number;
	iat: number;
	sub: string;
	tokenType: TokenType;
	username: string;
};

type TokenHeader = {
	alg: "HS256";
	typ: "JWT";
};

const encoder = new TextEncoder();
const TOKEN_HEADER: TokenHeader = { alg: "HS256", typ: "JWT" };

function encodeBase64Url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
	const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
	const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
}

function encodeJson(value: TokenHeader | TokenPayload): string {
	return encodeBase64Url(encoder.encode(JSON.stringify(value)));
}

function parseJson<T>(value: string): T | null {
	try {
		return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
	} catch {
		return null;
	}
}

function importSecret(secret: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ hash: "SHA-256", name: "HMAC" },
		false,
		["sign", "verify"],
	);
}

function getSecret(tokenType: TokenType): string {
	return tokenType === "access" ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET;
}

function getTtl(tokenType: TokenType): number {
	return tokenType === "access" ? ACCESS_TOKEN_TTL_SECONDS : REFRESH_TOKEN_TTL_SECONDS;
}

async function signToken(
	session: AuthSession,
	tokenType: TokenType,
	nowInSeconds = Math.floor(Date.now() / 1000),
): Promise<string> {
	const payload: TokenPayload = {
		exp: nowInSeconds + getTtl(tokenType),
		iat: nowInSeconds,
		sub: session.userId,
		tokenType,
		username: session.username,
	};
	const encodedHeader = encodeJson(TOKEN_HEADER);
	const encodedPayload = encodeJson(payload);
	const unsignedToken = `${encodedHeader}.${encodedPayload}`;
	const key = await importSecret(getSecret(tokenType));
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(unsignedToken));

	return `${unsignedToken}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function verifyToken(
	token: string | undefined,
	expectedType: TokenType,
	nowInSeconds = Math.floor(Date.now() / 1000),
): Promise<AuthSession | null> {
	if (!token) {
		return null;
	}

	const segments = token.split(".");
	if (segments.length !== 3) {
		return null;
	}

	const [encodedHeader, encodedPayload, encodedSignature] = segments;
	const header = parseJson<Partial<TokenHeader>>(encodedHeader);
	const payload = parseJson<Partial<TokenPayload>>(encodedPayload);
	if (
		header?.alg !== "HS256" ||
		header.typ !== "JWT" ||
		payload?.tokenType !== expectedType ||
		typeof payload.exp !== "number" ||
		payload.exp <= nowInSeconds ||
		typeof payload.iat !== "number" ||
		payload.iat > nowInSeconds ||
		typeof payload.sub !== "string" ||
		payload.sub.length === 0 ||
		typeof payload.username !== "string" ||
		payload.username.length === 0
	) {
		return null;
	}

	try {
		const key = await importSecret(getSecret(expectedType));
		const validSignature = await crypto.subtle.verify(
			"HMAC",
			key,
			decodeBase64Url(encodedSignature),
			encoder.encode(`${encodedHeader}.${encodedPayload}`),
		);
		if (!validSignature) {
			return null;
		}
	} catch {
		return null;
	}

	return { userId: payload.sub, username: payload.username };
}

export function signAccessToken(session: AuthSession): Promise<string> {
	return signToken(session, "access");
}

export function signRefreshToken(session: AuthSession): Promise<string> {
	return signToken(session, "refresh");
}

export function verifyAccessToken(token: string | undefined): Promise<AuthSession | null> {
	return verifyToken(token, "access");
}

export function verifyRefreshToken(token: string | undefined): Promise<AuthSession | null> {
	return verifyToken(token, "refresh");
}
