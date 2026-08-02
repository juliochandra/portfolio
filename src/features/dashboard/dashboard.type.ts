import type { PublishStatus } from "@/lib/publish-status";

export type DashboardRecentItem = {
	createdAt: string;
	id: string;
	status: PublishStatus;
	thumbnailImage: string | null;
	title: string;
};

export type DashboardRecentPost = DashboardRecentItem & {
	tags: { name: string }[];
};

export type DashboardRecentProject = DashboardRecentItem & {
	skills: { name: string }[];
};

export type DashboardSummary = {
	publishedPosts: number;
	publishedProjects: number;
	recentPosts: DashboardRecentPost[];
	recentProjects: DashboardRecentProject[];
	totalPosts: number;
	totalProjects: number;
	totalSkills: number;
	totalTags: number;
};

export type DashboardSummaryResponse = {
	data: DashboardSummary;
};
