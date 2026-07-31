"use server";

import { changePasswordSchema, loginSchema } from "@/features/auth/auth.schema";
import { authenticateUser, changeUserPassword } from "@/features/auth/auth.services";
import type {
	ChangePasswordInput,
	ChangePasswordResult,
	LoginInput,
	LoginResult,
	LogoutResult,
} from "@/features/auth/auth.type";
import { clearServerSession, getServerSession, setServerSession } from "@/shared/auth/server-session";
import { validateWithZod } from "@/shared/validation/zod";

const INVALID_CREDENTIALS_MESSAGE = "Username atau kata sandi salah.";
const UNAUTHORIZED = { error: { message: "UNAUTHORIZED" } } as const;

export async function login(data: LoginInput): Promise<LoginResult> {
	const validation = validateWithZod(loginSchema, data);
	if (!validation.success) {
		return { error: { message: INVALID_CREDENTIALS_MESSAGE } };
	}

	const user = await authenticateUser(validation.data);
	if (!user) {
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

export async function changePassword(data: ChangePasswordInput): Promise<ChangePasswordResult> {
	const session = await getServerSession();
	if (!session) {
		return UNAUTHORIZED;
	}

	const validation = validateWithZod(changePasswordSchema, data);
	if (!validation.success) {
		return { error: { fields: validation.fields } };
	}

	const result = await changeUserPassword({
		newPassword: validation.data.newPassword,
		oldPassword: validation.data.oldPassword,
		userId: session.userId,
	});
	if (!result.success) {
		if (result.reason === "USER_NOT_FOUND") {
			return UNAUTHORIZED;
		}

		return {
			error: { fields: { oldPassword: "Kata sandi lama tidak cocok." } },
		};
	}

	return { data: { success: true } };
}
