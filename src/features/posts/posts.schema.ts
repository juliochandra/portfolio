import { z } from "zod";
import type { PostInput } from "@/features/posts/posts.type";
import { publishStatuses } from "@/lib/publish-status";
import { emptyRichTextDocument, hasRichTextContent, parseRichTextDocument } from "@/lib/tiptap/json";

export const getPostsParamsSchema = z
	.object({
		limit: z.number().int().positive().optional(),
	})
	.optional();

export const adminPostsPageSchema = z.number().int().positive();

export const postSlugSchema = z.string().trim().min(1, "Slug tulisan wajib diisi.");

const REQUIRED_MESSAGE = "Wajib diisi.";

const requiredText = (maxLength: number) => z.string().trim().min(1, REQUIRED_MESSAGE).max(maxLength);

const requiredRichTextDocument = z
	.string()
	.trim()
	.min(1, REQUIRED_MESSAGE)
	.superRefine((value, context) => {
		const document = parseRichTextDocument(value);
		if (!document || !hasRichTextContent(document)) {
			context.addIssue({ code: "custom", message: REQUIRED_MESSAGE });
		}
	})
	.transform((value) => parseRichTextDocument(value) ?? emptyRichTextDocument);

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
	content: requiredRichTextDocument,
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

function readString(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === "string" ? value : "";
}

function readArray(formData: FormData, name: string): string[] {
	return [...formData.getAll(name), ...formData.getAll(`${name}[]`)].filter(
		(value): value is string => typeof value === "string",
	);
}

export function postFormDataToInput(formData: FormData): PostInput {
	const status = readString(formData, "status");

	return {
		content: readString(formData, "content"),
		description: readString(formData, "description"),
		status: status || undefined,
		tagIds: readArray(formData, "tagIds"),
		// biome-ignore lint/nursery/noSecrets: Field name mirrors the form and Zod schema.
		thumbnailImage: readString(formData, "thumbnailImage"),
		title: readString(formData, "title"),
	};
}
