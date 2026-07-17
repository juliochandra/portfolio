import { beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/shared/auth/cookies";
import { hashPassword } from "@/shared/auth/password";
import { createSessionTokens } from "@/shared/auth/session";

const mocks = vi.hoisted(() => ({
	cookies: vi.fn(),
	findUserById: vi.fn(),
	findUserByUsername: vi.fn(),
	updateUserPassword: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/features/auth/infrastructure/user-repository", () => ({
	findUserById: mocks.findUserById,
	findUserByUsername: mocks.findUserByUsername,
	updateUserPassword: mocks.updateUserPassword,
}));

import { changePassword, login, logout } from "@/features/auth/application/actions";

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
	const authUser = {
		id: "user-1",
		passwordHash: "",
		username: "admin",
	};
	let cookieFixture: ReturnType<typeof createCookieStore>;

	beforeEach(async () => {
		vi.clearAllMocks();
		process.env.JWT_ACCESS_SECRET = "test-access-secret-with-sufficient-entropy";
		process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-sufficient-entropy";
		cookieFixture = createCookieStore();
		mocks.cookies.mockResolvedValue(cookieFixture.store);
		authUser.passwordHash = await hashPassword("old-password");
		mocks.findUserByUsername.mockResolvedValue(authUser);
		mocks.findUserById.mockResolvedValue(authUser);
		mocks.updateUserPassword.mockResolvedValue(undefined);
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
		expect(cookieFixture.cookies.get(ACCESS_TOKEN_COOKIE)?.options?.httpOnly).toBe(true);
		expect(cookieFixture.cookies.get(REFRESH_TOKEN_COOKIE)?.options?.httpOnly).toBe(true);
	});

	it("returns the same generic error for invalid or incomplete credentials", async () => {
		const wrongPassword = await login({ username: "admin", password: "wrong" });
		const missingUsername = await login({ username: "", password: "old-password" });

		expect(wrongPassword).toEqual({
			error: { message: "Username atau kata sandi salah." },
		});
		expect(missingUsername).toEqual(wrongPassword);
		expect(cookieFixture.cookies).toHaveLength(0);
	});

	it("rejects logout without a valid session", async () => {
		await expect(logout()).resolves.toEqual({
			error: { message: "UNAUTHORIZED" },
		});
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

	it("changes the password when the old password and confirmation are valid", async () => {
		await addValidSession();

		await expect(
			changePassword({
				oldPassword: "old-password",
				newPassword: "new-password",
				confirmPassword: "new-password",
			}),
		).resolves.toEqual({ data: { success: true } });

		expect(mocks.updateUserPassword).toHaveBeenCalledOnce();
		const updatedHash = mocks.updateUserPassword.mock.calls[0][1] as string;
		await expect(compareHash("new-password", updatedHash)).resolves.toBe(true);
	});

	it("returns a field error for a wrong old password without ending the session", async () => {
		await addValidSession();

		const result = await changePassword({
			oldPassword: "wrong",
			newPassword: "new-password",
			confirmPassword: "new-password",
		});

		expect(result).toEqual({
			error: { fields: { oldPassword: "Kata sandi lama tidak cocok." } },
		});
		expect(mocks.updateUserPassword).not.toHaveBeenCalled();
		expect(cookieFixture.cookies.get(ACCESS_TOKEN_COOKIE)?.value).not.toBe("");
	});

	it("returns a field error when confirmation differs", async () => {
		await addValidSession();

		const result = await changePassword({
			oldPassword: "old-password",
			newPassword: "new-password",
			confirmPassword: "different-password",
		});

		expect(result).toEqual({
			error: {
				fields: { confirmPassword: "Konfirmasi kata sandi tidak cocok." },
			},
		});
		expect(mocks.updateUserPassword).not.toHaveBeenCalled();
	});

	it("checks authorization before changing a password", async () => {
		await expect(
			changePassword({
				oldPassword: "old-password",
				newPassword: "new-password",
				confirmPassword: "new-password",
			}),
		).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		expect(mocks.findUserById).not.toHaveBeenCalled();
	});
});

async function compareHash(password: string, hash: string): Promise<boolean> {
	const { comparePassword } = await import("@/shared/auth/password");
	return comparePassword(password, hash);
}
