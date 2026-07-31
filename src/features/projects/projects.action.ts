"use server";

import {
	adminProjectsPageSchema,
	type CreateProjectInput,
	createProjectSchema,
	type GetProjectsParams,
	getProjectsParamsSchema,
	projectFormDataToInput,
	projectIdSchema,
	projectSlugSchema,
	type UpdateProjectInput,
	updateProjectSchema,
} from "@/features/projects/projects.schema";
import {
	createAdminProject,
	deleteAdminProject,
	getProjectsAdmin as getAdminProjects,
	getProjectsAdminPage as getAdminProjectsPage,
	getProjectAdminById,
	getPublishedProjectBySlug,
	getPublishedProjects,
	type PublicProjectDetail,
	type PublicProjectListItem,
	updateAdminProject,
} from "@/features/projects/projects.services";
import { validateWithZod } from "@/lib/validation/zod";
import { getServerSession } from "@/shared/auth/server-session";

const INVALID_PROJECT_PARAMS_MESSAGE = "Parameter project tidak valid.";
const PROJECT_NOT_FOUND_MESSAGE = "Project tidak ditemukan.";
const UNAUTHORIZED = { error: { message: "UNAUTHORIZED" } } as const;

type GetProjectsResult = { data: PublicProjectListItem[] };

type GetProjectBySlugResult = { data: PublicProjectDetail } | { error: { message: string } };

type GetProjectsAdminResult = { data: Awaited<ReturnType<typeof getAdminProjects>> } | { error: { message: "UNAUTHORIZED" } };

type GetProjectsAdminPageResult =
	| { data: Awaited<ReturnType<typeof getAdminProjectsPage>> }
	| { error: { message: "UNAUTHORIZED" } };

type GetProjectAdminResult =
	| { data: NonNullable<Awaited<ReturnType<typeof getProjectAdminById>>> }
	| { error: { message: "Project tidak ditemukan." | "UNAUTHORIZED" } };

type ProjectMutationResult =
	| { data: { id: string; slug: string } }
	| { error: { fields: Record<string, string> } }
	| { error: { message: "UNAUTHORIZED" } };

type DeleteProjectResult = { data: { id: string } } | { error: { message: "Project tidak ditemukan." | "UNAUTHORIZED" } };

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

export async function getProjectsAdmin(): Promise<GetProjectsAdminResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	return { data: await getAdminProjects() };
}

export async function getProjectsAdminPage(page: number): Promise<GetProjectsAdminPageResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	const validation = validateWithZod(adminProjectsPageSchema, page);
	const currentPage = validation.success ? validation.data : 1;
	return { data: await getAdminProjectsPage(currentPage) };
}

export async function getProjectAdmin(id: string): Promise<GetProjectAdminResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}
	if (!validateWithZod(projectIdSchema, id).success) {
		return { error: { message: PROJECT_NOT_FOUND_MESSAGE } };
	}

	const project = await getProjectAdminById(id);
	return project ? { data: project } : { error: { message: PROJECT_NOT_FOUND_MESSAGE } };
}

export async function createProject(formData: FormData): Promise<ProjectMutationResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	const validation = validateWithZod(createProjectSchema, projectFormDataToInput(formData));
	if (!validation.success) {
		return { error: { fields: validation.fields } };
	}

	return { data: await createAdminProject(validation.data as CreateProjectInput) };
}

export async function updateProject(id: string, formData: FormData): Promise<ProjectMutationResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}
	if (!validateWithZod(projectIdSchema, id).success) {
		return { error: { fields: { _form: PROJECT_NOT_FOUND_MESSAGE } } };
	}

	const validation = validateWithZod(updateProjectSchema, projectFormDataToInput(formData));
	if (!validation.success) {
		return { error: { fields: validation.fields } };
	}

	const project = await updateAdminProject(id, validation.data as UpdateProjectInput);
	return project ? { data: project } : { error: { fields: { _form: PROJECT_NOT_FOUND_MESSAGE } } };
}

export async function deleteProject(id: string): Promise<DeleteProjectResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	if (!validateWithZod(projectIdSchema, id).success) {
		return { error: { message: PROJECT_NOT_FOUND_MESSAGE } };
	}

	const project = await deleteAdminProject(id);
	return project ? { data: project } : { error: { message: PROJECT_NOT_FOUND_MESSAGE } };
}
