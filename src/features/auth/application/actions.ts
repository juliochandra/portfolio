"use server";

import {
	changePasswordSchema,
	loginSchema,
	validationFields,
} from "@/features/auth/domain/validation";
import {
	findUserById,
	findUserByUsername,
	updateUserPassword,
} from "@/features/auth/infrastructure/user-repository";
import { comparePassword, hashPassword } from "@/shared/auth/password";
import {
	clearServerSession,
	getServerSession,
	setServerSession,
} from "@/shared/auth/server-session";

const INVALID_CREDENTIALS_MESSAGE = "Username atau kata sandi salah.";
const UNAUTHORIZED = { error: { message: "UNAUTHORIZED" } } as const;

type LoginResult = { data: { username: string } } | { error: { message: string } };

type LogoutResult = { data: { success: true } } | { error: { message: "UNAUTHORIZED" } };

type ChangePasswordResult =
	| { data: { success: true } }
	| { error: { fields: Record<string, string> } }
	| { error: { message: "UNAUTHORIZED" } };

export async function login(data: { password: string; username: string }): Promise<LoginResult> {
	const parsed = loginSchema.safeParse(data);
	if (!parsed.success) {
		return { error: { message: INVALID_CREDENTIALS_MESSAGE } };
	}

	const user = await findUserByUsername(parsed.data.username);
	if (!user || !(await comparePassword(parsed.data.password, user.passwordHash))) {
		return { error: { message: INVALID_CREDENTIALS_MESSAGE } };
	}

	await setServerSession({ userId: user.id, username: user.username });
	return { data: { username: user.username } };
}

export async function logout(): Promise<LogoutResult> {
	const session = await getServerSession();
	if (!session) {
		return UNAUTHORIZED;
	}

	await clearServerSession();
	return { data: { success: true } };
}

export async function changePassword(data: {
	confirmPassword: string;
	newPassword: string;
	oldPassword: string;
}): Promise<ChangePasswordResult> {
	const session = await getServerSession();
	if (!session) {
		return UNAUTHORIZED;
	}

	const parsed = changePasswordSchema.safeParse(data);
	if (!parsed.success) {
		return { error: { fields: validationFields(parsed.error) } };
	}

	const user = await findUserById(session.userId);
	if (!user) {
		return UNAUTHORIZED;
	}

	const oldPasswordMatches = await comparePassword(parsed.data.oldPassword, user.passwordHash);
	if (!oldPasswordMatches) {
		return {
			error: { fields: { oldPassword: "Kata sandi lama tidak cocok." } },
		};
	}

	const passwordHash = await hashPassword(parsed.data.newPassword);
	await updateUserPassword(user.id, passwordHash);
	return { data: { success: true } };
}
