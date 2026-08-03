import {
	countProjectsAdmin,
	createProjectRecord,
	deleteProjectRecord,
	findProjectBySlug,
	findProjectDetailForAdmin,
	findProjectForAdmin,
	findProjects,
	findProjectsAdmin,
	isProjectSlugAvailable,
	type ProjectDetailRecord,
	type ProjectListRecord,
	updateProjectRecord,
} from "@/features/projects/projects.repository";
import {
	adminProjectsPageSchema,
	createProjectSchema,
	getProjectsParamsSchema,
	projectSlugSchema,
	updateProjectSchema,
} from "@/features/projects/projects.schema";
import type {
	AdminProjectDetail,
	AdminProjectListItem,
	AdminProjectListPage,
	GetProjectsParams,
	ProjectInput,
	ProjectSkill,
	PublicProjectDetail,
	PublicProjectListItem,
} from "@/features/projects/projects.type";
import { PublishStatus, toPublishStatus } from "@/lib/publish-status";
import { NotFoundException, ValidationException } from "@/lib/server-action-exception/exceptions";
import { generateUniqueSlug } from "@/lib/slug";
import { emptyRichTextDocument, parseRichTextDocument, serializeRichTextDocument } from "@/lib/tiptap/json";
import { validateWithZod } from "@/lib/validation/zod";

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
		content: parseRichTextDocument(project.content) ?? emptyRichTextDocument,
		publishedAt: project.publishedAt,
		tags: project.tags,
	};
}

export async function getPublishedProjects(params?: GetProjectsParams): Promise<PublicProjectListItem[]> {
	const validation = validateWithZod(getProjectsParamsSchema, params);
	if (!validation.success) {
		throw new ValidationException(validation.fields, "Parameter project tidak valid.");
	}

	const projects = await findProjects({
		limit: validation.data?.limit,
		status: PublishStatus.PUBLISHED,
	});
	return projects.map(toPublicProjectListItem);
}

export async function getPublishedProjectBySlug(slug: string): Promise<PublicProjectDetail> {
	const validation = validateWithZod(projectSlugSchema, slug);
	if (!validation.success) {
		throw new NotFoundException("Project tidak ditemukan.");
	}

	const project = await findProjectBySlug({ slug: validation.data, status: PublishStatus.PUBLISHED });
	if (!project) {
		throw new NotFoundException("Project tidak ditemukan.");
	}

	return toPublicProjectDetail(project);
}

function toAdminProjectListItem(project: Awaited<ReturnType<typeof findProjectsAdmin>>[number]): AdminProjectListItem {
	return { ...project, status: toPublishStatus(project.status) };
}

export async function getProjectsAdmin(): Promise<AdminProjectListItem[]> {
	const projects = await findProjectsAdmin();
	return projects.map(toAdminProjectListItem);
}

export const ADMIN_PROJECTS_PER_PAGE = 10;

export async function getProjectsAdminPage(page: number): Promise<AdminProjectListPage> {
	const validation = validateWithZod(adminProjectsPageSchema, page);
	if (!validation.success) {
		throw new ValidationException(validation.fields, "Halaman project tidak valid.");
	}

	const totalProjects = await countProjectsAdmin();
	const totalPages = Math.max(1, Math.ceil(totalProjects / ADMIN_PROJECTS_PER_PAGE));
	const currentPage = Math.min(validation.data, totalPages);
	const projects = await findProjectsAdmin({
		skip: (currentPage - 1) * ADMIN_PROJECTS_PER_PAGE,
		take: ADMIN_PROJECTS_PER_PAGE,
	});

	return { currentPage, projects: projects.map(toAdminProjectListItem), totalPages };
}

export async function getProjectAdminById(id: string): Promise<AdminProjectDetail> {
	const project = await findProjectDetailForAdmin(id);
	if (!project) {
		throw new NotFoundException("Project tidak ditemukan.");
	}

	return {
		...project,
		skillIds: project.skills.map((skill) => skill.id),
		status: toPublishStatus(project.status),
		tagIds: project.tags.map((tag) => tag.id),
	};
}

export async function createAdminProject(input: ProjectInput): Promise<{ id: string; slug: string }> {
	const validation = validateWithZod(createProjectSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const slug = await generateUniqueSlug(validation.data.title, isProjectSlugAvailable);
	const publishedAt = validation.data.status === PublishStatus.PUBLISHED ? new Date() : null;

	return createProjectRecord({
		...validation.data,
		content: serializeRichTextDocument(validation.data.content),
		publishedAt,
		slug,
	});
}

export async function updateAdminProject(id: string, input: ProjectInput): Promise<{ id: string; slug: string }> {
	const validation = validateWithZod(updateProjectSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const existing = await findProjectForAdmin(id);
	if (!existing) {
		throw new NotFoundException("Project tidak ditemukan.");
	}

	const slug =
		existing.title === validation.data.title
			? existing.slug
			: await generateUniqueSlug(validation.data.title, (candidate) => isProjectSlugAvailable(candidate, id));
	const publishedAt = existing.publishedAt ?? (validation.data.status === PublishStatus.PUBLISHED ? new Date() : null);

	return updateProjectRecord(id, {
		...validation.data,
		content: serializeRichTextDocument(validation.data.content),
		publishedAt,
		slug,
	});
}

export async function deleteAdminProject(id: string): Promise<{ id: string }> {
	const existing = await findProjectForAdmin(id);
	if (!existing) {
		throw new NotFoundException("Project tidak ditemukan.");
	}

	return deleteProjectRecord(id);
}
