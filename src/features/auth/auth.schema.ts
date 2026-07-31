import { z } from "zod";

const requiredPassword = z.string().min(1, "Wajib diisi.");

export const loginSchema = z.object({
	password: requiredPassword,
	username: z.string().trim().min(1, "Wajib diisi."),
});

export const changePasswordSchema = z
	.object({
		confirmPassword: requiredPassword,
		newPassword: requiredPassword,
		oldPassword: requiredPassword,
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Konfirmasi kata sandi tidak cocok.",
		// biome-ignore lint/nursery/noSecrets: field name, not a credential
		path: ["confirmPassword"],
	});
