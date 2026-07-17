"use server";

import {
	type GetProjectsParams,
	getProjectsParamsSchema,
	projectSlugSchema,
} from "@/features/projects/projects.schema";
import {
	getPublishedProjectBySlug,
	getPublishedProjects,
	type PublicProjectDetail,
	type PublicProjectListItem,
} from "@/features/projects/projects.services";
import { validateWithZod } from "@/shared/validation/zod";

const INVALID_PROJECT_PARAMS_MESSAGE = "Parameter project tidak valid.";
const PROJECT_NOT_FOUND_MESSAGE = "Project tidak ditemukan.";

type GetProjectsResult = { data: PublicProjectListItem[] };

type GetProjectBySlugResult = { data: PublicProjectDetail } | { error: { message: string } };

export async function getProjects(params?: GetProjectsParams): Promise<GetProjectsResult> {
	const validation = validateWithZod(getProjectsParamsSchema, params);
	if (!validation.success) {
		throw new Error(INVALID_PROJECT_PARAMS_MESSAGE);
	}

	return {
		data: await getPublishedProjects(validation.data),
	};
}

export async function getProjectBySlug(slug: string): Promise<GetProjectBySlugResult> {
	const validation = validateWithZod(projectSlugSchema, slug);
	if (!validation.success) {
		return { error: { message: PROJECT_NOT_FOUND_MESSAGE } };
	}

	const project = await getPublishedProjectBySlug(validation.data);
	return project ? { data: project } : { error: { message: PROJECT_NOT_FOUND_MESSAGE } };
}
