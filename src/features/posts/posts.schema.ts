import { z } from "zod";
import { PublishStatus } from "@/generated/prisma/client";

export const getPostsParamsSchema = z
	.object({
		limit: z.number().int().positive().optional(),
	})
	.optional();

export type GetPostsParams = z.infer<typeof getPostsParamsSchema>;

export const postSlugSchema = z.string().trim().min(1);
export const postIdSchema = z.string().trim().min(1);

const REQUIRED_MESSAGE = "Wajib diisi.";

const requiredText = (maxLength: number) => z.string().trim().min(1, REQUIRED_MESSAGE).max(maxLength);

const optionalText = (maxLength: number) =>
	z
		.string()
		.trim()
		.max(maxLength)
		.optional()
		.transform((value) => value || null);

const optionalUrl = (maxLength: number) =>
	z
		.string()
		.trim()
		.max(maxLength)
		.refine((value) => value.length === 0 || z.url().safeParse(value).success, "URL tidak valid.")
		.optional()
		.transform((value) => value || null);

const postInputSchema = z.object({
	content: requiredText(Number.MAX_SAFE_INTEGER),
	description: optionalText(300),
	tagIds: z.array(z.string().trim().min(1)).default([]),
	thumbnailImage: optionalUrl(255),
	title: requiredText(200),
});

export const createPostSchema = postInputSchema.extend({
	status: z.nativeEnum(PublishStatus).default(PublishStatus.DRAFT),
});

export const updatePostSchema = postInputSchema.extend({
	status: z.nativeEnum(PublishStatus),
});

export type CreatePostInput = z.output<typeof createPostSchema>;
export type UpdatePostInput = z.output<typeof updatePostSchema>;
