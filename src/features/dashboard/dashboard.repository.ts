import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";
import { PublishStatus } from "@/shared/publish-status";

const recentPostSelect = {
	createdAt: true,
	id: true,
	status: true,
	tags: { select: { name: true } },
	thumbnailImage: true,
	title: true,
} satisfies Prisma.PostSelect;

const recentProjectSelect = {
	createdAt: true,
	id: true,
	skills: { select: { name: true } },
	status: true,
	thumbnailImage: true,
	title: true,
} satisfies Prisma.ProjectSelect;

export type RecentPostRecord = Prisma.PostGetPayload<{ select: typeof recentPostSelect }>;
export type RecentProjectRecord = Prisma.ProjectGetPayload<{ select: typeof recentProjectSelect }>;

export async function getDashboardRecords(): Promise<{
	posts: number;
	projects: number;
	publishedPosts: number;
	publishedProjects: number;
	recentPosts: RecentPostRecord[];
	recentProjects: RecentProjectRecord[];
	skills: number;
	tags: number;
}> {
	const [posts, publishedPosts, projects, publishedProjects, tags, skills, recentPosts, recentProjects] = await Promise.all([
		prisma.post.count(),
		prisma.post.count({ where: { status: PublishStatus.PUBLISHED } }),
		prisma.project.count(),
		prisma.project.count({ where: { status: PublishStatus.PUBLISHED } }),
		prisma.tag.count(),
		prisma.skill.count(),
		prisma.post.findMany({ orderBy: { createdAt: "desc" }, select: recentPostSelect, take: 5 }),
		prisma.project.findMany({ orderBy: { createdAt: "desc" }, select: recentProjectSelect, take: 5 }),
	]);
	return { posts, projects, publishedPosts, publishedProjects, recentPosts, recentProjects, skills, tags };
}
