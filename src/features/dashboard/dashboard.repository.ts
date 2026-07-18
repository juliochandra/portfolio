import type { Prisma } from "@/generated/prisma/client";
import { PublishStatus } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";

const recentSelect = { createdAt: true, id: true, status: true, thumbnailImage: true, title: true } satisfies Prisma.PostSelect;
export type RecentRecord = Prisma.PostGetPayload<{ select: typeof recentSelect }>;

export async function getDashboardRecords(): Promise<{
	posts: number;
	projects: number;
	publishedPosts: number;
	publishedProjects: number;
	recentPosts: RecentRecord[];
	recentProjects: RecentRecord[];
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
		prisma.post.findMany({ orderBy: { createdAt: "desc" }, select: recentSelect, take: 5 }),
		prisma.project.findMany({ orderBy: { createdAt: "desc" }, select: recentSelect, take: 5 }),
	]);
	return { posts, projects, publishedPosts, publishedProjects, recentPosts, recentProjects, skills, tags };
}
