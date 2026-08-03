import { z } from "zod";

const REQUIRED_MESSAGE = "Wajib diisi.";

const tagInputSchema = z.object({
	name: z.string().trim().min(1, REQUIRED_MESSAGE).max(50),
});

export const createTagSchema = tagInputSchema;
export const updateTagSchema = tagInputSchema;
