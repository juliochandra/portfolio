import { z } from "zod";

export const createContactInfoSchema = z.object({
	icon: z
		.string()
		.trim()
		.max(100)
		.nullable()
		.transform((value) => value || null),
	label: z
		.string()
		.trim()
		.min(1, "Wajib diisi.")
		.max(100)
		.transform((value) => value.replaceAll(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("id-ID"))),
	value: z.string().trim().min(1, "Wajib diisi.").max(255).url("URL tidak valid."),
});

export const updateContactInfoSchema = createContactInfoSchema;
