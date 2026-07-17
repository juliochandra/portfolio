import type { Prisma, PublishStatus } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";

const projectListSelect = {
	description: true,
	id: true,
	skills: { select: { icon: true, name: true } },
	slug: true,
	thumbnailImage: true,
	title: true,
} satisfies Prisma.ProjectSelect;

const projectDetailSelect = {
	...projectListSelect,
	content: true,
	demoUrl: true,
	repositoryUrl: true,
	tags: { select: { name: true } },
} satisfies Prisma.ProjectSelect;

export type ProjectListRecord = Prisma.ProjectGetPayload<{ select: typeof projectListSelect }>;

export type ProjectDetailRecord = Prisma.ProjectGetPayload<{ select: typeof projectDetailSelect }>;

export function findProjects(params: {
	limit?: number;
	status: PublishStatus;
}): Promise<ProjectListRecord[]> {
	return prisma.project.findMany({
		orderBy: { publishedAt: "desc" },
		select: projectListSelect,
		take: params.limit,
		where: { status: params.status },
	});
}

export function findProjectBySlug(params: {
	slug: string;
	status: PublishStatus;
}): Promise<ProjectDetailRecord | null> {
	return prisma.project.findFirst({
		select: projectDetailSelect,
		where: { slug: params.slug, status: params.status },
	});
}
