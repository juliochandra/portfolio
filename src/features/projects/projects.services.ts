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
import type { CreateProjectInput, UpdateProjectInput } from "@/features/projects/projects.schema";
import { generateUniqueSlug } from "@/lib/slug";
import {
	emptyRichTextDocument,
	parseRichTextDocument,
	type RichTextDocument,
	serializeRichTextDocument,
} from "@/lib/tiptap/json";
import { PublishStatus, toPublishStatus } from "@/shared/publish-status";

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
	content: RichTextDocument;
	publishedAt: Date | null;
	tags: { name: string }[];
};

export type AdminProjectListItem = {
	description: string | null;
	id: string;
	status: PublishStatus;
	title: string;
};

export type AdminProjectDetail = {
	content: string;
	demoUrl: string | null;
	description: string | null;
	id: string;
	repositoryUrl: string | null;
	skillIds: string[];
	status: PublishStatus;
	tagIds: string[];
	thumbnailImage: string | null;
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
		content: parseRichTextDocument(project.content) ?? emptyRichTextDocument,
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

function toAdminProjectListItem(project: Awaited<ReturnType<typeof findProjectsAdmin>>[number]): AdminProjectListItem {
	return { ...project, status: toPublishStatus(project.status) };
}

export async function getProjectsAdmin(): Promise<AdminProjectListItem[]> {
	const projects = await findProjectsAdmin();
	return projects.map(toAdminProjectListItem);
}

export const ADMIN_PROJECTS_PER_PAGE = 10;

export type AdminProjectListPage = {
	currentPage: number;
	projects: AdminProjectListItem[];
	totalPages: number;
};

export async function getProjectsAdminPage(page: number): Promise<AdminProjectListPage> {
	const totalProjects = await countProjectsAdmin();
	const totalPages = Math.max(1, Math.ceil(totalProjects / ADMIN_PROJECTS_PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const projects = await findProjectsAdmin({
		skip: (currentPage - 1) * ADMIN_PROJECTS_PER_PAGE,
		take: ADMIN_PROJECTS_PER_PAGE,
	});

	return { currentPage, projects: projects.map(toAdminProjectListItem), totalPages };
}

export async function getProjectAdminById(id: string): Promise<AdminProjectDetail | null> {
	const project = await findProjectDetailForAdmin(id);
	if (!project) {
		return null;
	}

	return {
		...project,
		skillIds: project.skills.map((skill) => skill.id),
		status: toPublishStatus(project.status),
		tagIds: project.tags.map((tag) => tag.id),
	};
}

export async function createAdminProject(input: CreateProjectInput): Promise<{ id: string; slug: string }> {
	const slug = await generateUniqueSlug(input.title, isProjectSlugAvailable);
	const publishedAt = input.status === PublishStatus.PUBLISHED ? new Date() : null;

	return createProjectRecord({
		...input,
		content: serializeRichTextDocument(input.content),
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
		content: serializeRichTextDocument(input.content),
		publishedAt,
		slug,
	});
}

export async function deleteAdminProject(id: string): Promise<{ id: string } | null> {
	const existing = await findProjectForAdmin(id);
	return existing ? deleteProjectRecord(id) : null;
}
