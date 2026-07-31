import { findUserById, findUserByUsername, updateUserPassword } from "@/features/auth/auth.repository";
import type {
	AuthenticatedUser,
	ChangeUserPasswordInput,
	ChangeUserPasswordResult,
	LoginInput,
} from "@/features/auth/auth.type";
import { comparePassword, hashPassword } from "@/lib/auth/password";

export async function authenticateUser(input: LoginInput): Promise<AuthenticatedUser | null> {
	const user = await findUserByUsername(input.username);
	if (!user || !(await comparePassword(input.password, user.passwordHash))) {
		return null;
	}

	return { id: user.id, username: user.username };
}

export async function changeUserPassword(input: ChangeUserPasswordInput): Promise<ChangeUserPasswordResult> {
	const user = await findUserById(input.userId);
	if (!user) {
		return { reason: "USER_NOT_FOUND", success: false };
	}

	if (!(await comparePassword(input.oldPassword, user.passwordHash))) {
		return { reason: "OLD_PASSWORD_MISMATCH", success: false };
	}

	const passwordHash = await hashPassword(input.newPassword);
	await updateUserPassword(user.id, passwordHash);
	return { success: true };
}
