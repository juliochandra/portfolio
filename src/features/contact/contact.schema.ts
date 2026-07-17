import { z } from "zod";

export const contactInfoIdSchema = z.string().trim().min(1);

const REQUIRED_MESSAGE = "Wajib diisi.";

const requiredText = (maxLength: number) => z.string().trim().min(1, REQUIRED_MESSAGE).max(maxLength);

const optionalText = (maxLength: number) =>
	z
		.string()
		.trim()
		.max(maxLength)
		.optional()
		.transform((value) => value || null);

const contactInfoInputSchema = z.object({
	icon: optionalText(100),
	label: requiredText(100),
	value: requiredText(255),
});

export const createContactInfoSchema = contactInfoInputSchema;
export const updateContactInfoSchema = contactInfoInputSchema;

export type CreateContactInfoInput = z.output<typeof createContactInfoSchema>;
export type UpdateContactInfoInput = z.output<typeof updateContactInfoSchema>;
