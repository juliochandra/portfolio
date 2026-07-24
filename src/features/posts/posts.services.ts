import {
	countPostsAdmin,
	createPostRecord,
	deletePostRecord,
	findNextPublishedPost,
	findPostBySlug,
	findPostDetailForAdmin,
	findPostForAdmin,
	findPosts,
	findPostsAdmin,
	findPreviousPublishedPost,
	isPostSlugAvailable,
	type PostDetailRecord,
	type PostListRecord,
	updatePostRecord,
} from "@/features/posts/posts.repository";
import type { CreatePostInput, UpdatePostInput } from "@/features/posts/posts.schema";
import { PublishStatus, toPublishStatus } from "@/shared/publish-status";
import { richTextToPlainText, sanitizeRichText } from "@/shared/rich-text";
import { generateUniqueSlug } from "@/shared/slug";

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

export type PublicPostDetail = PublicPostListItem & {
	content: string;
	nextPost: PublicPostNavigationItem | null;
	prevPost: PublicPostNavigationItem | null;
};

export type PublicPostNavigationItem = {
	slug: string;
	title: string;
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

type PostWithPublishedAt<TPost extends PostListRecord> = TPost & { publishedAt: Date };

function hasPublishedAt<TPost extends PostListRecord>(post: TPost): post is PostWithPublishedAt<TPost> {
	return post.publishedAt !== null;
}

function toPublicPostListItem(post: PostWithPublishedAt<PostListRecord>): PublicPostListItem {
	return {
		description: post.description,
		id: post.id,
		publishedAt: post.publishedAt.toISOString(),
		readingTime: post.readingTime,
		slug: post.slug,
		tags: post.tags,
		thumbnailImage: post.thumbnailImage,
		title: post.title,
	};
}

function toPublicPostNavigationItem(post: { slug: string; title: string } | null): PublicPostNavigationItem | null {
	return post ? { slug: post.slug, title: post.title } : null;
}

function toPublicPostDetail(
	post: PostWithPublishedAt<PostDetailRecord>,
	previousPost: PublicPostNavigationItem | null,
	nextPost: PublicPostNavigationItem | null,
): PublicPostDetail {
	return {
		...toPublicPostListItem(post),
		content: post.content,
		nextPost,
		prevPost: previousPost,
	};
}

export async function getPublishedPosts(params?: { limit?: number }): Promise<PublicPostListItem[]> {
	const posts = await findPosts({
		limit: params?.limit,
		status: PublishStatus.PUBLISHED,
	});
	return posts.filter(hasPublishedAt).map(toPublicPostListItem);
}

export async function getPublishedPostBySlug(slug: string): Promise<PublicPostDetail | null> {
	const post = await findPostBySlug({ slug, status: PublishStatus.PUBLISHED });
	if (!post || !hasPublishedAt(post)) {
		return null;
	}

	const [previousPost, nextPost] = await Promise.all([
		findPreviousPublishedPost({ publishedAt: post.publishedAt }),
		findNextPublishedPost({ publishedAt: post.publishedAt }),
	]);
	return toPublicPostDetail(post, toPublicPostNavigationItem(previousPost), toPublicPostNavigationItem(nextPost));
}

export async function getPostsAdmin(): Promise<AdminPostListItem[]> {
	const posts = await findPostsAdmin();
	return posts.map((post) => ({
		...post,
		createdAt: post.createdAt.toISOString(),
		status: toPublishStatus(post.status),
	}));
}

export const ADMIN_POSTS_PER_PAGE = 10;

export type AdminPostListPage = {
	currentPage: number;
	posts: AdminPostListItem[];
	totalPages: number;
};

export async function getPostsAdminPage(page: number): Promise<AdminPostListPage> {
	const totalPosts = await countPostsAdmin();
	const totalPages = Math.max(1, Math.ceil(totalPosts / ADMIN_POSTS_PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const posts = await findPostsAdmin({
		skip: (currentPage - 1) * ADMIN_POSTS_PER_PAGE,
		take: ADMIN_POSTS_PER_PAGE,
	});

	return {
		currentPage,
		posts: posts.map((post) => ({
			...post,
			createdAt: post.createdAt.toISOString(),
			status: toPublishStatus(post.status),
		})),
		totalPages,
	};
}

export async function getPostAdminById(id: string): Promise<AdminPostDetail | null> {
	const post = await findPostDetailForAdmin(id);
	if (!post) {
		return null;
	}

	const { tags, ...postDetail } = post;
	return {
		...postDetail,
		status: toPublishStatus(postDetail.status),
		tagIds: tags.map((tag) => tag.id),
	};
}

export function calculateReadingTime(content: string): number {
	const wordCount = content.trim().split(/\s+/u).filter(Boolean).length;
	return Math.max(1, Math.ceil(wordCount / 200));
}

export async function createAdminPost(input: CreatePostInput): Promise<{ id: string; slug: string }> {
	const slug = await generateUniqueSlug(input.title, isPostSlugAvailable);
	const publishedAt = input.status === PublishStatus.PUBLISHED ? new Date() : null;
	const content = sanitizeRichText(input.content);

	return createPostRecord({
		...input,
		content,
		publishedAt,
		readingTime: calculateReadingTime(richTextToPlainText(content)),
		slug,
	});
}

export async function updateAdminPost(id: string, input: UpdatePostInput): Promise<{ id: string; slug: string } | null> {
	const existing = await findPostForAdmin(id);
	if (!existing) {
		return null;
	}

	const slug =
		existing.title === input.title
			? existing.slug
			: await generateUniqueSlug(input.title, (candidate) => isPostSlugAvailable(candidate, id));
	const publishedAt = existing.publishedAt ?? (input.status === PublishStatus.PUBLISHED ? new Date() : null);
	const content = sanitizeRichText(input.content);

	return updatePostRecord(id, {
		...input,
		content,
		publishedAt,
		readingTime: calculateReadingTime(richTextToPlainText(content)),
		slug,
	});
}

export async function deleteAdminPost(id: string): Promise<{ id: string } | null> {
	const existing = await findPostForAdmin(id);
	return existing ? deletePostRecord(id) : null;
}
