"use server";

import { authenticateUser, changeUserPassword } from "@/features/auth/auth.services";
import type { AuthSuccessResponse, ChangePasswordInput, LoginInput, LoginResponse } from "@/features/auth/auth.type";
import { clearServerSession, requireServerSession, setServerSession } from "@/lib/auth/server-session";
import { toServerActionFailure } from "@/lib/server-action-exception/to-server-action-failure";
import type { ServerActionFailure } from "@/lib/server-action-exception/types";

export async function login(data: LoginInput): Promise<LoginResponse | ServerActionFailure> {
	try {
		const user = await authenticateUser(data);
		await setServerSession({ userId: user.id, username: user.username });

		return { data: { username: user.username } };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function logout(): Promise<AuthSuccessResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		await clearServerSession();

		return { data: { success: true } };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function changePassword(data: ChangePasswordInput): Promise<AuthSuccessResponse | ServerActionFailure> {
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
