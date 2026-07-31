import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { createSessionTokens } from "@/lib/auth/session";

const mocks = vi.hoisted(() => ({
	authenticateUser: vi.fn(),
	changeUserPassword: vi.fn(),
	cookies: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/features/auth/auth.services", () => ({
	authenticateUser: mocks.authenticateUser,
	changeUserPassword: mocks.changeUserPassword,
}));

import { changePassword, login, logout } from "@/features/auth/auth.action";

type StoredCookie = {
	options?: { httpOnly?: boolean; maxAge?: number };
	value: string;
};

function createCookieStore(): {
	cookies: Map<string, StoredCookie>;
	store: {
		get: (name: string) => { value: string } | undefined;
		set: (name: string, value: string, options?: { httpOnly?: boolean; maxAge?: number }) => void;
	};
} {
	const storedCookies = new Map<string, StoredCookie>();
	return {
		cookies: storedCookies,
		store: {
			get: (name) => {
				const cookie = storedCookies.get(name);
				return cookie ? { value: cookie.value } : undefined;
			},
			set: (name, value, options) => {
				storedCookies.set(name, { options, value });
			},
		},
	};
}

describe("auth Server Actions", () => {
	const authUser = { id: "user-1", username: "admin" };
	let cookieFixture: ReturnType<typeof createCookieStore>;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env.JWT_ACCESS_SECRET = "test-access-secret-with-sufficient-entropy";
		process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-sufficient-entropy";
		cookieFixture = createCookieStore();
		mocks.cookies.mockResolvedValue(cookieFixture.store);
		mocks.authenticateUser.mockResolvedValue(authUser);
		mocks.changeUserPassword.mockResolvedValue({ success: true });
	});

	async function addValidSession(): Promise<void> {
		const tokens = await createSessionTokens({
			userId: authUser.id,
			username: authUser.username,
		});
		cookieFixture.cookies.set(ACCESS_TOKEN_COOKIE, { value: tokens.accessToken });
		cookieFixture.cookies.set(REFRESH_TOKEN_COOKIE, { value: tokens.refreshToken });
	}

	it("logs in with valid credentials and sets both httpOnly cookies", async () => {
		const result = await login({ username: "admin", password: "old-password" });

		expect(result).toEqual({ data: { username: "admin" } });
		expect(mocks.authenticateUser).toHaveBeenCalledWith({
			password: "old-password",
			username: "admin",
		});
		expect(cookieFixture.cookies.get(ACCESS_TOKEN_COOKIE)?.options?.httpOnly).toBe(true);
		expect(cookieFixture.cookies.get(REFRESH_TOKEN_COOKIE)?.options?.httpOnly).toBe(true);
	});

	it("returns a generic error for incomplete credentials without calling the service", async () => {
		const result = await login({ username: "", password: "old-password" });

		expect(result).toEqual({ error: { message: "Username atau kata sandi salah." } });
		expect(mocks.authenticateUser).not.toHaveBeenCalled();
		expect(cookieFixture.cookies).toHaveLength(0);
	});

	it("returns the same generic error when authentication fails", async () => {
		mocks.authenticateUser.mockResolvedValue(null);

		await expect(login({ username: "admin", password: "wrong" })).resolves.toEqual({
			error: { message: "Username atau kata sandi salah." },
		});
		expect(cookieFixture.cookies).toHaveLength(0);
	});

	it("rejects logout without a valid session", async () => {
		await expect(logout()).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
	});

	it("logs out a valid session by expiring both cookies", async () => {
		await addValidSession();

		await expect(logout()).resolves.toEqual({ data: { success: true } });
		expect(cookieFixture.cookies.get(ACCESS_TOKEN_COOKIE)).toMatchObject({
			options: { maxAge: 0 },
			value: "",
		});
		expect(cookieFixture.cookies.get(REFRESH_TOKEN_COOKIE)).toMatchObject({
			options: { maxAge: 0 },
			value: "",
		});
	});

	it("changes the password through the service for a valid session", async () => {
		await addValidSession();

		await expect(
			changePassword({
				oldPassword: "old-password",
				newPassword: "new-password",
				confirmPassword: "new-password",
			}),
		).resolves.toEqual({ data: { success: true } });
		expect(mocks.changeUserPassword).toHaveBeenCalledWith({
			newPassword: "new-password",
			oldPassword: "old-password",
			userId: authUser.id,
		});
	});

	it("maps an old-password mismatch to a field error without ending the session", async () => {
		await addValidSession();
		mocks.changeUserPassword.mockResolvedValue({
			reason: "OLD_PASSWORD_MISMATCH",
			success: false,
		});

		await expect(
			changePassword({
				oldPassword: "wrong",
				newPassword: "new-password",
				confirmPassword: "new-password",
			}),
		).resolves.toEqual({
			error: { fields: { oldPassword: "Kata sandi lama tidak cocok." } },
		});
		expect(cookieFixture.cookies.get(ACCESS_TOKEN_COOKIE)?.value).not.toBe("");
	});

	it("returns unauthorized when the session user no longer exists", async () => {
		await addValidSession();
		mocks.changeUserPassword.mockResolvedValue({
			reason: "USER_NOT_FOUND",
			success: false,
		});

		await expect(
			changePassword({
				oldPassword: "old-password",
				newPassword: "new-password",
				confirmPassword: "new-password",
			}),
		).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
	});

	it("returns a field error when confirmation differs", async () => {
		await addValidSession();

		await expect(
			changePassword({
				oldPassword: "old-password",
				newPassword: "new-password",
				confirmPassword: "different-password",
			}),
		).resolves.toEqual({
			error: { fields: { confirmPassword: "Konfirmasi kata sandi tidak cocok." } },
		});
		expect(mocks.changeUserPassword).not.toHaveBeenCalled();
	});

	it("checks authorization before changing a password", async () => {
		await expect(
			changePassword({
				oldPassword: "old-password",
				newPassword: "new-password",
				confirmPassword: "new-password",
			}),
		).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		expect(mocks.changeUserPassword).not.toHaveBeenCalled();
	});
});
