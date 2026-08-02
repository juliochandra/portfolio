"use server";

import { authenticateUser, changeUserPassword } from "@/features/auth/auth.services";
import type {
	ChangePasswordInput,
	ChangePasswordResult,
	LoginInput,
	LoginResult,
	LogoutResult,
} from "@/features/auth/auth.type";
import { clearServerSession, requireServerSession, setServerSession } from "@/lib/auth/server-session";
import { toServerActionFailure } from "@/lib/server-action-exception/to-server-action-failure";

export async function login(data: LoginInput): Promise<LoginResult> {
	try {
		const user = await authenticateUser(data);
		await setServerSession({ userId: user.id, username: user.username });

		return { data: { username: user.username } };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function logout(): Promise<LogoutResult> {
	try {
		await requireServerSession();
		await clearServerSession();

		return { data: { success: true } };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function changePassword(data: ChangePasswordInput): Promise<ChangePasswordResult> {
	try {
		const session = await requireServerSession();
		await changeUserPassword({
			...data,
			userId: session.userId,
		});

		return { data: { success: true } };
	} catch (error) {
		return toServerActionFailure(error);
	}
}
