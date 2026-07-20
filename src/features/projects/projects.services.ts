import {
	createProjectRecord,
	deleteProjectRecord,
	findProjectBySlug,
	findProjectForAdmin,
	findProjects,
	findProjectsAdmin,
	isProjectSlugAvailable,
	type ProjectDetailRecord,
	type ProjectListRecord,
	updateProjectRecord,
} from "@/features/projects/projects.repository";
import type { CreateProjectInput, UpdateProjectInput } from "@/features/projects/projects.schema";
import { PublishStatus } from "@/generated/prisma/client";
import { generateUniqueSlug } from "@/shared/slug";

export type ProjectSkill = {
	icon: string;
	name: string;
};

export type PublicProjectListItem = {
	demoUrl: string | null;
	description: string | null;
	id: string;
	repositoryUrl: string | null;
	skills: ProjectSkill[];
	slug: string;
	thumbnailImage: string | null;
	title: string;
};

export type PublicProjectDetail = PublicProjectListItem & {
	content: string;
	publishedAt: Date | null;
	tags: { name: string }[];
};

export type AdminProjectListItem = {
	description: string | null;
	id: string;
	status: PublishStatus;
	title: string;
};

function completeSkills(skills: ProjectListRecord["skills"]): ProjectSkill[] {
	return skills.filter((skill): skill is ProjectSkill => skill.icon !== null);
}

function toPublicProjectListItem(project: ProjectListRecord): PublicProjectListItem {
	return {
		demoUrl: project.demoUrl,
		description: project.description,
		id: project.id,
		repositoryUrl: project.repositoryUrl,
		skills: completeSkills(project.skills),
		slug: project.slug,
		thumbnailImage: project.thumbnailImage,
		title: project.title,
	};
}

function toPublicProjectDetail(project: ProjectDetailRecord): PublicProjectDetail {
	return {
		...toPublicProjectListItem(project),
		content: project.content,
		publishedAt: project.publishedAt,
		tags: project.tags,
	};
}

export async function getPublishedProjects(params?: { limit?: number }): Promise<PublicProjectListItem[]> {
	const projects = await findProjects({
		limit: params?.limit,
		status: PublishStatus.PUBLISHED,
	});
	return projects.map(toPublicProjectListItem);
}

export async function getPublishedProjectBySlug(slug: string): Promise<PublicProjectDetail | null> {
	const project = await findProjectBySlug({ slug, status: PublishStatus.PUBLISHED });
	return project ? toPublicProjectDetail(project) : null;
}

export function getProjectsAdmin(): Promise<AdminProjectListItem[]> {
	return findProjectsAdmin();
}

export async function createAdminProject(input: CreateProjectInput): Promise<{ id: string; slug: string }> {
	const slug = await generateUniqueSlug(input.title, isProjectSlugAvailable);
	const publishedAt = input.status === PublishStatus.PUBLISHED ? new Date() : null;

	return createProjectRecord({
		...input,
		publishedAt,
		slug,
	});
}

export async function updateAdminProject(id: string, input: UpdateProjectInput): Promise<{ id: string; slug: string } | null> {
	const existing = await findProjectForAdmin(id);
	if (!existing) {
		return null;
	}

	const slug =
		existing.title === input.title
			? existing.slug
			: await generateUniqueSlug(input.title, (candidate) => isProjectSlugAvailable(candidate, id));
	const publishedAt = existing.publishedAt ?? (input.status === PublishStatus.PUBLISHED ? new Date() : null);

	return updateProjectRecord(id, {
		...input,
		publishedAt,
		slug,
	});
}

export async function deleteAdminProject(id: string): Promise<{ id: string } | null> {
	const existing = await findProjectForAdmin(id);
	return existing ? deleteProjectRecord(id) : null;
}
