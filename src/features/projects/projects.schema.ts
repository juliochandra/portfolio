/** biome-ignore-all lint/nursery/noSecrets: <> */
import { z } from "zod";
import { PublishStatus } from "@/generated/prisma/client";

export const getProjectsParamsSchema = z
	.object({
		limit: z.number().int().positive().optional(),
	})
	.optional();

export type GetProjectsParams = z.infer<typeof getProjectsParamsSchema>;

export const projectSlugSchema = z.string().trim().min(1);
export const projectIdSchema = z.string().trim().min(1);

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

const projectInputSchema = z.object({
	content: requiredText(Number.MAX_SAFE_INTEGER),
	demoUrl: optionalText(255),
	description: requiredText(300),
	repositoryUrl: optionalText(255),
	skillIds: z.array(z.string().trim().min(1)).default([]),
	tagIds: z.array(z.string().trim().min(1)).default([]),
	thumbnailImage: optionalUrl(255),
	title: requiredText(200),
});

export const createProjectSchema = projectInputSchema.extend({
	status: z.nativeEnum(PublishStatus).default(PublishStatus.DRAFT),
});

export const updateProjectSchema = projectInputSchema.extend({
	status: z.nativeEnum(PublishStatus),
});

export type CreateProjectInput = z.output<typeof createProjectSchema>;
export type UpdateProjectInput = z.output<typeof updateProjectSchema>;

function readString(formData: FormData, name: string): unknown {
	return formData.get(name) ?? "";
}

function readArray(formData: FormData, name: string): unknown[] {
	return [...formData.getAll(name), ...formData.getAll(`${name}[]`)];
}

export function projectFormDataToInput(formData: FormData): Record<string, unknown> {
	return {
		content: readString(formData, "content"),
		demoUrl: readString(formData, "demoUrl"),
		description: readString(formData, "description"),
		repositoryUrl: readString(formData, "repositoryUrl"),
		skillIds: readArray(formData, "skillIds"),
		status: formData.get("status") ?? undefined,
		tagIds: readArray(formData, "tagIds"),
		thumbnailImage: readString(formData, "thumbnailImage"),
		title: readString(formData, "title"),
	};
}
