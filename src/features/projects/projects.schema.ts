/** biome-ignore-all lint/nursery/noSecrets: <> */
import { z } from "zod";
import type { ProjectInput } from "@/features/projects/projects.type";
import { publishStatuses } from "@/lib/publish-status";
import { emptyRichTextDocument, hasRichTextContent, parseRichTextDocument } from "@/lib/tiptap/json";

export const getProjectsParamsSchema = z
	.object({
		limit: z.number().int().positive().optional(),
	})
	.optional();

export const adminProjectsPageSchema = z.number().int().positive();

export const projectSlugSchema = z.string().trim().min(1, "Slug project wajib diisi.");

const REQUIRED_MESSAGE = "Wajib diisi.";

const requiredText = (maxLength: number) => z.string().trim().min(1, REQUIRED_MESSAGE).max(maxLength);

const optionalText = (maxLength: number) =>
	z
		.string()
		.trim()
		.max(maxLength)
		.transform((value) => value || null);

const optionalUrl = (maxLength: number) =>
	z
		.string()
		.trim()
		.max(maxLength)
		.refine((value) => value.length === 0 || z.url().safeParse(value).success, "URL tidak valid.")
		.transform((value) => value || null);

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

const projectInputSchema = z.object({
	content: requiredRichTextDocument,
	demoUrl: optionalText(255),
	description: requiredText(300),
	repositoryUrl: optionalText(255),
	skillIds: z.array(z.string().trim().min(1)).default([]),
	tagIds: z.array(z.string().trim().min(1)).default([]),
	thumbnailImage: optionalUrl(255),
	title: requiredText(200),
});

export const createProjectSchema = projectInputSchema.extend({
	status: z.enum(publishStatuses).default("DRAFT"),
});

export const updateProjectSchema = projectInputSchema.extend({
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

export function projectFormDataToInput(formData: FormData): ProjectInput {
	const status = readString(formData, "status");

	return {
		content: readString(formData, "content"),
		demoUrl: readString(formData, "demoUrl"),
		description: readString(formData, "description"),
		repositoryUrl: readString(formData, "repositoryUrl"),
		skillIds: readArray(formData, "skillIds"),
		status: status || undefined,
		tagIds: readArray(formData, "tagIds"),
		thumbnailImage: readString(formData, "thumbnailImage"),
		title: readString(formData, "title"),
	};
}
