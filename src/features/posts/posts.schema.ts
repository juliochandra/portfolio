import { z } from "zod";

export const getPostsParamsSchema = z
	.object({
		limit: z.number().int().positive().optional(),
	})
	.optional();

export type GetPostsParams = z.infer<typeof getPostsParamsSchema>;

export const postSlugSchema = z.string().trim().min(1);
