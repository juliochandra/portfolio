import type { PublishStatus } from "@/lib/publish-status";
import type { RichTextDocument } from "@/lib/tiptap/json";

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

export type AdminProjectListPage = {
	currentPage: number;
	projects: AdminProjectListItem[];
	totalPages: number;
};

export type GetProjectsParams = {
	limit?: number;
};

export type ProjectInput = {
	content: string;
	demoUrl?: string;
	description: string;
	repositoryUrl?: string;
	skillIds?: string[];
	status?: string;
	tagIds?: string[];
	thumbnailImage?: string;
	title: string;
};

export type GetProjectsResponse = { data: PublicProjectListItem[] };

export type GetProjectBySlugResponse = { data: PublicProjectDetail };

export type GetProjectsAdminResponse = { data: AdminProjectListItem[] };

export type GetProjectsAdminPageResponse = { data: AdminProjectListPage };

export type GetProjectAdminResponse = { data: AdminProjectDetail };

export type ProjectMutationResponse = {
	data: {
		id: string;
		slug: string;
	};
};

export type DeleteProjectResponse = { data: { id: string } };
