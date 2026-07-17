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

export function validationFields(error: z.ZodError): Record<string, string> {
	const fields: Record<string, string> = {};
	for (const issue of error.issues) {
		const field = issue.path[0];
		if (typeof field === "string" && !fields[field]) {
			fields[field] = issue.message;
		}
	}

	return fields;
}
