export type LoginInput = {
	password: string;
	username: string;
};

export type ChangePasswordInput = {
	confirmPassword: string;
	newPassword: string;
	oldPassword: string;
};

export type AuthUser = {
	id: string;
	passwordHash: string;
	username: string;
};

export type AuthenticatedUser = {
	id: string;
	username: string;
};

export type ChangeUserPasswordInput = {
	newPassword: string;
	oldPassword: string;
	userId: string;
};

export type ChangeUserPasswordResult =
	| { success: true }
	| { reason: "OLD_PASSWORD_MISMATCH" | "USER_NOT_FOUND"; success: false };

export type LoginResult = { data: { username: string } } | { error: { message: string } };

export type LogoutResult = { data: { success: true } } | { error: { message: "UNAUTHORIZED" } };

export type ChangePasswordResult =
	| { data: { success: true } }
	| { error: { fields: Record<string, string> } }
	| { error: { message: "UNAUTHORIZED" } };
