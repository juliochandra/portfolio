import { getDashboardRecords, type RecentRecord } from "@/features/dashboard/dashboard.repository";
import type { PublishStatus } from "@/generated/prisma/client";

type RecentItem = { createdAt: string; id: string; status: PublishStatus; thumbnailImage: string | null; title: string };
export type DashboardSummary = {
	publishedPosts: number;
	publishedProjects: number;
	recentPosts: RecentItem[];
	recentProjects: RecentItem[];
	totalPosts: number;
	totalProjects: number;
	totalSkills: number;
	totalTags: number;
};
const toRecent = (item: RecentRecord): RecentItem => ({ ...item, createdAt: item.createdAt.toISOString() });
export async function getDashboardSummary(): Promise<DashboardSummary> {
	const result = await getDashboardRecords();
	return {
		publishedPosts: result.publishedPosts,
		publishedProjects: result.publishedProjects,
		recentPosts: result.recentPosts.map(toRecent),
		recentProjects: result.recentProjects.map(toRecent),
		totalPosts: result.posts,
		totalProjects: result.projects,
		totalSkills: result.skills,
		totalTags: result.tags,
	};
}
