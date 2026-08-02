import { findUserById, findUserByUsername, updateUserPassword } from "@/features/auth/auth.repository";
import { changePasswordSchema, loginSchema } from "@/features/auth/auth.schema";
import type { AuthenticatedUser, ChangeUserPasswordInput, LoginInput } from "@/features/auth/auth.type";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { UnauthorizedException, ValidationException } from "@/lib/server-action-exception/exceptions";
import { validateWithZod } from "@/lib/validation/zod";

export async function authenticateUser(input: LoginInput): Promise<AuthenticatedUser> {
	const validation = validateWithZod(loginSchema, input);
	if (!validation.success) {
		throw new UnauthorizedException("Username atau kata sandi salah.");
	}

	const user = await findUserByUsername(validation.data.username);
	if (!user || !(await comparePassword(validation.data.password, user.passwordHash))) {
		throw new UnauthorizedException("Username atau kata sandi salah.");
	}

	return { id: user.id, username: user.username };
}

export async function changeUserPassword(input: ChangeUserPasswordInput): Promise<void> {
	const validation = validateWithZod(changePasswordSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	if (validation.data.newPassword !== validation.data.confirmPassword) {
		throw new ValidationException({ confirmPassword: "Konfirmasi kata sandi tidak cocok." });
	}

	const user = await findUserById(input.userId);
	if (!user) {
		throw new UnauthorizedException("UNAUTHORIZED");
	}

	if (!(await comparePassword(validation.data.oldPassword, user.passwordHash))) {
		throw new ValidationException({ oldPassword: "Kata sandi lama tidak cocok." }, "Kata sandi lama tidak cocok.");
	}

	const passwordHash = await hashPassword(validation.data.newPassword);
	await updateUserPassword(user.id, passwordHash);
}
