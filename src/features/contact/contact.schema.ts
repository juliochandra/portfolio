import { z } from "zod";

export const contactInfoIdSchema = z.string().trim().min(1);

const REQUIRED_MESSAGE = "Wajib diisi.";

const requiredText = (maxLength: number) => z.string().trim().min(1, REQUIRED_MESSAGE).max(maxLength);

const contactLabel = (maxLength: number) =>
	requiredText(maxLength).transform((value) => value.replaceAll(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("id-ID")));

const optionalText = (maxLength: number) =>
	z
		.string()
		.trim()
		.max(maxLength)
		.optional()
		.transform((value) => value || null);

const requiredUrl = (maxLength: number) => z.string().trim().min(1, REQUIRED_MESSAGE).max(maxLength).url("URL tidak valid.");

const contactInfoInputSchema = z.object({
	icon: optionalText(100),
	label: contactLabel(100),
	value: requiredUrl(255),
});

export const createContactInfoSchema = contactInfoInputSchema;
export const updateContactInfoSchema = contactInfoInputSchema;

export type CreateContactInfoInput = z.output<typeof createContactInfoSchema>;
export type UpdateContactInfoInput = z.output<typeof updateContactInfoSchema>;
