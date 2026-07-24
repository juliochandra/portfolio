import { z } from "zod";

export const tagIdSchema = z.string().trim().min(1);

const REQUIRED_MESSAGE = "Wajib diisi.";

const tagInputSchema = z.object({
	name: z.string().trim().min(1, REQUIRED_MESSAGE).max(50),
});

export const createTagSchema = tagInputSchema;
export const updateTagSchema = tagInputSchema;

export type CreateTagInput = z.output<typeof createTagSchema>;
export type UpdateTagInput = z.output<typeof updateTagSchema>;
