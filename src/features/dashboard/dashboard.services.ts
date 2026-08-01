import {
	getDashboardRecords,
	type RecentPostRecord,
	type RecentProjectRecord,
} from "@/features/dashboard/dashboard.repository";
import { type PublishStatus, toPublishStatus } from "@/lib/publish-status";

type RecentItem = {
	createdAt: string;
	id: string;
	status: PublishStatus;
	thumbnailImage: string | null;
	title: string;
};

type RecentPost = RecentItem & { tags: { name: string }[] };
type RecentProject = RecentItem & { skills: { name: string }[] };

export type DashboardSummary = {
	publishedPosts: number;
	publishedProjects: number;
	recentPosts: RecentPost[];
	recentProjects: RecentProject[];
	totalPosts: number;
	totalProjects: number;
	totalSkills: number;
	totalTags: number;
};

function toRecentPost(item: RecentPostRecord): RecentPost {
	return { ...item, createdAt: item.createdAt.toISOString(), status: toPublishStatus(item.status) };
}

function toRecentProject(item: RecentProjectRecord): RecentProject {
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
