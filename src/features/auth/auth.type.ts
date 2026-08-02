import type { ServerActionFailure } from "@/lib/server-action-exception/types";

export type LoginInput = {
	password: string;
	username: string;
};

export type ChangePasswordInput = {
	confirmPassword: string;
	newPassword: string;
	oldPassword: string;
};

export type AuthenticatedUser = {
	id: string;
	username: string;
};

export type ChangeUserPasswordInput = {
	confirmPassword: string;
	newPassword: string;
	oldPassword: string;
	userId: string;
};

export type LoginResult = { data: { username: string } } | ServerActionFailure;

export type LogoutResult = { data: { success: true } } | ServerActionFailure;

export type ChangePasswordResult = { data: { success: true } } | ServerActionFailure;
