import {
	findProjectBySlug,
	findProjects,
	type ProjectDetailRecord,
	type ProjectListRecord,
} from "@/features/projects/projects.repository";
import { PublishStatus } from "@/generated/prisma/client";

export type ProjectSkill = {
	icon: string;
	name: string;
};

export type PublicProjectListItem = {
	description: string | null;
	id: string;
	skills: ProjectSkill[];
	slug: string;
	thumbnailImage: string | null;
	title: string;
};

export type PublicProjectDetail = PublicProjectListItem & {
	content: string;
	demoUrl: string | null;
	repositoryUrl: string | null;
	tags: { name: string }[];
};

function completeSkills(skills: ProjectListRecord["skills"]): ProjectSkill[] {
	return skills.filter((skill): skill is ProjectSkill => skill.icon !== null);
}

function toPublicProjectListItem(project: ProjectListRecord): PublicProjectListItem {
	return {
		description: project.description,
		id: project.id,
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
		demoUrl: project.demoUrl,
		repositoryUrl: project.repositoryUrl,
		tags: project.tags,
	};
}

export async function getPublishedProjects(params?: {
	limit?: number;
}): Promise<PublicProjectListItem[]> {
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
