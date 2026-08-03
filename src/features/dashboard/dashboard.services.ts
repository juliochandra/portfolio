import {
	getDashboardRecords,
	type RecentPostRecord,
	type RecentProjectRecord,
} from "@/features/dashboard/dashboard.repository";
import type { DashboardRecentPost, DashboardRecentProject, DashboardSummary } from "@/features/dashboard/dashboard.type";
import { toPublishStatus } from "@/lib/publish-status";

function toRecentPost(item: RecentPostRecord): DashboardRecentPost {
	return { ...item, createdAt: item.createdAt.toISOString(), status: toPublishStatus(item.status) };
}

function toRecentProject(item: RecentProjectRecord): DashboardRecentProject {
	return { ...item, createdAt: item.createdAt.toISOString(), status: toPublishStatus(item.status) };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
	const result = await getDashboardRecords();
	return {
		publishedPosts: result.publishedPosts,
		publishedProjects: result.publishedProjects,
		recentPosts: result.recentPosts.map(toRecentPost),
		recentProjects: result.recentProjects.map(toRecentProject),
		totalPosts: result.posts,
		totalProjects: result.projects,
		totalSkills: result.skills,
		totalTags: result.tags,
	};
}
