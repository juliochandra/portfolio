import { z } from "zod";

export const skillIdSchema = z.string().trim().min(1);

const REQUIRED_MESSAGE = "Wajib diisi.";

const requiredText = (maxLength: number) => z.string().trim().min(1, REQUIRED_MESSAGE).max(maxLength);

const requiredUrl = (maxLength: number) =>
	z
		.string()
		.trim()
		.min(1, REQUIRED_MESSAGE)
		.max(maxLength)
		.refine((value) => z.url().safeParse(value).success, "URL ikon tidak valid.");

const skillInputSchema = z.object({
	icon: requiredUrl(255),
	name: requiredText(50),
});

export const createSkillSchema = skillInputSchema;
export const updateSkillSchema = skillInputSchema;

export type CreateSkillInput = z.output<typeof createSkillSchema>;
export type UpdateSkillInput = z.output<typeof updateSkillSchema>;
