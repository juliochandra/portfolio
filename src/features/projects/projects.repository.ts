import type { Prisma, PublishStatus } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";

const projectListSelect = {
	demoUrl: true,
	description: true,
	id: true,
	repositoryUrl: true,
	skills: { select: { icon: true, name: true } },
	slug: true,
	thumbnailImage: true,
	title: true,
} satisfies Prisma.ProjectSelect;

const projectDetailSelect = {
	...projectListSelect,
	content: true,
	tags: { select: { name: true } },
} satisfies Prisma.ProjectSelect;

const adminProjectListSelect = {
	description: true,
	id: true,
	status: true,
	title: true,
} satisfies Prisma.ProjectSelect;

const adminProjectSelect = {
	publishedAt: true,
	slug: true,
	title: true,
} satisfies Prisma.ProjectSelect;

export type ProjectListRecord = Prisma.ProjectGetPayload<{ select: typeof projectListSelect }>;

export type ProjectDetailRecord = Prisma.ProjectGetPayload<{ select: typeof projectDetailSelect }>;

export type AdminProjectListRecord = Prisma.ProjectGetPayload<{ select: typeof adminProjectListSelect }>;

export type AdminProjectRecord = Prisma.ProjectGetPayload<{ select: typeof adminProjectSelect }>;

export type ProjectWriteInput = {
	content: string;
	demoUrl: string | null;
	description: string;
	publishedAt: Date | null;
	repositoryUrl: string | null;
	skillIds: string[];
	slug: string;
	status: PublishStatus;
	tagIds: string[];
	thumbnailImage: string | null;
	title: string;
};

export function findProjects(params: { limit?: number; status: PublishStatus }): Promise<ProjectListRecord[]> {
	return prisma.project.findMany({
		orderBy: { publishedAt: "desc" },
		select: projectListSelect,
		take: params.limit,
		where: { status: params.status },
	});
}

export function findProjectBySlug(params: { slug: string; status: PublishStatus }): Promise<ProjectDetailRecord | null> {
	return prisma.project.findFirst({
		select: projectDetailSelect,
		where: { slug: params.slug, status: params.status },
	});
}

export function findProjectsAdmin(): Promise<AdminProjectListRecord[]> {
	return prisma.project.findMany({
		orderBy: { createdAt: "desc" },
		select: adminProjectListSelect,
	});
}

export function findProjectForAdmin(id: string): Promise<AdminProjectRecord | null> {
	return prisma.project.findUnique({
		select: adminProjectSelect,
		where: { id },
	});
}

export async function isProjectSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
	const project = await prisma.project.findUnique({
		select: { id: true },
		where: { slug },
	});
	return !project || project.id === excludeId;
}

function projectRelations(input: ProjectWriteInput): Pick<Prisma.ProjectCreateInput, "skills" | "tags"> {
	return {
		skills: { connect: input.skillIds.map((id) => ({ id })) },
		tags: { connect: input.tagIds.map((id) => ({ id })) },
	};
}

function projectUpdateRelations(input: ProjectWriteInput): Pick<Prisma.ProjectUpdateInput, "skills" | "tags"> {
	return {
		skills: { set: input.skillIds.map((id) => ({ id })) },
		tags: { set: input.tagIds.map((id) => ({ id })) },
	};
}

const mutationResultSelect = {
	id: true,
	slug: true,
} satisfies Prisma.ProjectSelect;

export function createProjectRecord(input: ProjectWriteInput): Promise<{ id: string; slug: string }> {
	return prisma.project.create({
		data: {
			...projectRelations(input),
			content: input.content,
			demoUrl: input.demoUrl,
			description: input.description,
			publishedAt: input.publishedAt,
			repositoryUrl: input.repositoryUrl,
			slug: input.slug,
			status: input.status,
			thumbnailImage: input.thumbnailImage,
			title: input.title,
		},
		select: mutationResultSelect,
	});
}

export function updateProjectRecord(id: string, input: ProjectWriteInput): Promise<{ id: string; slug: string }> {
	return prisma.project.update({
		data: {
			...projectUpdateRelations(input),
			content: input.content,
			demoUrl: input.demoUrl,
			description: input.description,
			publishedAt: input.publishedAt,
			repositoryUrl: input.repositoryUrl,
			slug: input.slug,
			status: input.status,
			thumbnailImage: input.thumbnailImage,
			title: input.title,
		},
		select: mutationResultSelect,
		where: { id },
	});
}

export function deleteProjectRecord(id: string): Promise<{ id: string }> {
	return prisma.project.delete({
		select: { id: true },
		where: { id },
	});
}
