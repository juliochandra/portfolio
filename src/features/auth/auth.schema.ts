import { z } from "zod";

export const loginSchema = z.object({
	password: z.string().min(1, "Wajib diisi."),
	username: z.string().trim().min(1, "Wajib diisi."),
});

export const changePasswordSchema = z.object({
	confirmPassword: z.string().min(1, "Wajib diisi."),
	newPassword: z.string().min(1, "Wajib diisi."),
	oldPassword: z.string().min(1, "Wajib diisi."),
});
