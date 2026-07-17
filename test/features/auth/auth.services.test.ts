import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashPassword } from "@/shared/auth/password";

const mocks = vi.hoisted(() => ({
	findUserById: vi.fn(),
	findUserByUsername: vi.fn(),
	updateUserPassword: vi.fn(),
}));

vi.mock("@/features/auth/auth.repository", () => ({
	findUserById: mocks.findUserById,
	findUserByUsername: mocks.findUserByUsername,
	updateUserPassword: mocks.updateUserPassword,
}));

import { authenticateUser, changeUserPassword } from "@/features/auth/auth.services";

describe("auth services", () => {
	const authUser = {
		id: "user-1",
		passwordHash: "",
		username: "admin",
	};

	beforeEach(async () => {
		vi.clearAllMocks();
		authUser.passwordHash = await hashPassword("old-password");
		mocks.findUserByUsername.mockResolvedValue(authUser);
		mocks.findUserById.mockResolvedValue(authUser);
		mocks.updateUserPassword.mockResolvedValue(undefined);
	});

	it("authenticates valid credentials without exposing the password hash", async () => {
		await expect(authenticateUser({ username: "admin", password: "old-password" })).resolves.toEqual({
			id: authUser.id,
			username: authUser.username,
		});
	});

	it("rejects unknown users and wrong passwords", async () => {
		mocks.findUserByUsername.mockResolvedValueOnce(null);

		await expect(authenticateUser({ username: "unknown", password: "old-password" })).resolves.toBeNull();
		await expect(authenticateUser({ username: "admin", password: "wrong" })).resolves.toBeNull();
	});

	it("reports a missing user when changing a password", async () => {
		mocks.findUserById.mockResolvedValue(null);

		await expect(
			changeUserPassword({
				newPassword: "new-password",
				oldPassword: "old-password",
				userId: authUser.id,
			}),
		).resolves.toEqual({ reason: "USER_NOT_FOUND", success: false });
		expect(mocks.updateUserPassword).not.toHaveBeenCalled();
	});

	it("rejects an incorrect old password", async () => {
		await expect(
			changeUserPassword({
				newPassword: "new-password",
				oldPassword: "wrong",
				userId: authUser.id,
			}),
		).resolves.toEqual({ reason: "OLD_PASSWORD_MISMATCH", success: false });
		expect(mocks.updateUserPassword).not.toHaveBeenCalled();
	});

	it("hashes and persists a valid new password", async () => {
		await expect(
			changeUserPassword({
				newPassword: "new-password",
				oldPassword: "old-password",
				userId: authUser.id,
			}),
		).resolves.toEqual({ success: true });

		expect(mocks.updateUserPassword).toHaveBeenCalledOnce();
		expect(mocks.updateUserPassword.mock.calls[0][0]).toBe(authUser.id);
		expect(mocks.updateUserPassword.mock.calls[0][1]).not.toBe("new-password");
	});
});
