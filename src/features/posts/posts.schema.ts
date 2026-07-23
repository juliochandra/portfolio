import { z } from "zod";
import { publishStatuses } from "@/shared/publish-status";

export const getPostsParamsSchema = z
	.object({
		limit: z.number().int().positive().optional(),
	})
	.optional();

export type GetPostsParams = z.infer<typeof getPostsParamsSchema>;

export const adminPostsPageSchema = z.number().int().positive();

export const postSlugSchema = z.string().trim().min(1);
export const postIdSchema = z.string().trim().min(1);

const REQUIRED_MESSAGE = "Wajib diisi.";

const requiredText = (maxLength: number) => z.string().trim().min(1, REQUIRED_MESSAGE).max(maxLength);

const requiredRichText = z
	.string()
	.trim()
	.refine(
		(value) =>
			value
				.replace(/<[^>]*>/gu, " ")
				.replace(/&nbsp;/gu, " ")
				.trim().length > 0,
		REQUIRED_MESSAGE,
	);

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
	content: requiredRichText,
	description: optionalText(300),
	tagIds: z.array(z.string().trim().min(1)).default([]),
	thumbnailImage: optionalUrl(255),
	title: requiredText(200),
});

export const createPostSchema = postInputSchema.extend({
	status: z.enum(publishStatuses).default("DRAFT"),
});

export const updatePostSchema = postInputSchema.extend({
	status: z.enum(publishStatuses),
});

export type CreatePostInput = z.output<typeof createPostSchema>;
export type UpdatePostInput = z.output<typeof updatePostSchema>;

function readString(formData: FormData, name: string): unknown {
	return formData.get(name) ?? "";
}

function readArray(formData: FormData, name: string): unknown[] {
	return [...formData.getAll(name), ...formData.getAll(`${name}[]`)];
}

export function postFormDataToInput(formData: FormData): Record<string, unknown> {
	return {
		content: readString(formData, "content"),
		description: readString(formData, "description"),
		status: formData.get("status") ?? undefined,
		tagIds: readArray(formData, "tagIds"),
		// biome-ignore lint/nursery/noSecrets: Field name mirrors the form and Zod schema.
		thumbnailImage: readString(formData, "thumbnailImage"),
		title: readString(formData, "title"),
	};
}
