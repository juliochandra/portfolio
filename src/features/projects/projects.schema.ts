import { z } from "zod";

export const getProjectsParamsSchema = z
	.object({
		limit: z.number().int().positive().optional(),
	})
	.optional();

export type GetProjectsParams = z.infer<typeof getProjectsParamsSchema>;

export const projectSlugSchema = z.string().trim().min(1);
