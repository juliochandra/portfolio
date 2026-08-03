"use server";

import {
	createAdminProject,
	deleteAdminProject,
	getProjectsAdmin as getAdminProjects,
	getProjectsAdminPage as getAdminProjectsPage,
	getProjectAdminById,
	getPublishedProjectBySlug,
	getPublishedProjects,
	updateAdminProject,
} from "@/features/projects/projects.services";
import type {
	DeleteProjectResponse,
	GetProjectAdminResponse,
	GetProjectBySlugResponse,
	GetProjectsAdminPageResponse,
	GetProjectsAdminResponse,
	GetProjectsParams,
	GetProjectsResponse,
	ProjectInput,
	ProjectMutationResponse,
} from "@/features/projects/projects.type";
import { requireServerSession } from "@/lib/auth/server-session";
import { toServerActionFailure } from "@/lib/server-action-exception/to-server-action-failure";
import type { ServerActionFailure } from "@/lib/server-action-exception/types";

export async function getProjects(params?: GetProjectsParams): Promise<GetProjectsResponse | ServerActionFailure> {
	try {
		return { data: await getPublishedProjects(params) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getProjectBySlug(slug: string): Promise<GetProjectBySlugResponse | ServerActionFailure> {
	try {
		return { data: await getPublishedProjectBySlug(slug) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getProjectsAdmin(): Promise<GetProjectsAdminResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getAdminProjects() };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getProjectsAdminPage(page: number): Promise<GetProjectsAdminPageResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getAdminProjectsPage(page) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getProjectAdmin(id: string): Promise<GetProjectAdminResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getProjectAdminById(id) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function createProject(input: ProjectInput): Promise<ProjectMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await createAdminProject(input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function updateProject(id: string, input: ProjectInput): Promise<ProjectMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await updateAdminProject(id, input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function deleteProject(id: string): Promise<DeleteProjectResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await deleteAdminProject(id) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}
