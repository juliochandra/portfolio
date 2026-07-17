import { z } from "zod";

export const skillIdSchema = z.string().trim().min(1);

const REQUIRED_MESSAGE = "Wajib diisi.";

const requiredText = (maxLength: number) => z.string().trim().min(1, REQUIRED_MESSAGE).max(maxLength);

const skillInputSchema = z.object({
	icon: requiredText(100),
	name: requiredText(50),
});

export const createSkillSchema = skillInputSchema;
export const updateSkillSchema = skillInputSchema;

export type CreateSkillInput = z.output<typeof createSkillSchema>;
export type UpdateSkillInput = z.output<typeof updateSkillSchema>;
