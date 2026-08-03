import type { PublishStatus } from "@/lib/publish-status";
import type { RichTextDocument } from "@/lib/tiptap/json";

export type PublicPostListItem = {
	description: string | null;
	id: string;
	publishedAt: string;
	readingTime: number;
	slug: string;
	tags: { name: string }[];
	thumbnailImage: string | null;
	title: string;
};

export type PublicPostNavigationItem = {
	slug: string;
	title: string;
};

export type PublicPostDetail = PublicPostListItem & {
	content: RichTextDocument;
	nextPost: PublicPostNavigationItem | null;
	prevPost: PublicPostNavigationItem | null;
};

export type AdminPostListItem = {
	createdAt: string;
	id: string;
	status: PublishStatus;
	title: string;
};

export type AdminPostDetail = {
	content: string;
	description: string | null;
	id: string;
	status: PublishStatus;
	tagIds: string[];
	thumbnailImage: string | null;
	title: string;
};

export type AdminPostListPage = {
	currentPage: number;
	posts: AdminPostListItem[];
	totalPages: number;
};

export type GetPostsParams = {
	limit?: number;
};

export type PostInput = {
	content: string;
	description?: string;
	status?: string;
	tagIds?: string[];
	thumbnailImage?: string;
	title: string;
};

export type GetPostsResponse = {
	data: PublicPostListItem[];
};

export type GetPostBySlugResponse = {
	data: PublicPostDetail;
};

export type GetPostsAdminResponse = {
	data: AdminPostListItem[];
};

export type GetPostsAdminPageResponse = {
	data: AdminPostListPage;
};

export type GetPostAdminResponse = {
	data: AdminPostDetail;
};

export type PostMutationResponse = {
	data: {
		id: string;
		slug: string;
	};
};

export type DeletePostResponse = {
	data: {
		id: string;
	};
};
