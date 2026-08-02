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

export type LoginResponse = {
	data: {
		username: string;
	};
};

export type AuthSuccessResponse = {
	data: {
		success: true;
	};
};
