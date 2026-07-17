import {
	createPostRecord,
	deletePostRecord,
	findPostBySlug,
	findPostForAdmin,
	findPosts,
	findPostsAdmin,
	isPostSlugAvailable,
	type PostDetailRecord,
	type PostListRecord,
	updatePostRecord,
} from "@/features/posts/posts.repository";
import type { CreatePostInput, UpdatePostInput } from "@/features/posts/posts.schema";
import { PublishStatus } from "@/generated/prisma/client";
import { generateUniqueSlug } from "@/shared/slug";

export type PublicPostListItem = {
	description: string | null;
	id: string;
	publishedAt: string;
	slug: string;
	thumbnailImage: string | null;
	title: string;
};

export type PublicPostDetail = PublicPostListItem & {
	content: string;
	readingTime: number;
	tags: { name: string }[];
};

export type AdminPostListItem = {
	createdAt: string;
	id: string;
	status: PublishStatus;
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
		slug: post.slug,
		thumbnailImage: post.thumbnailImage,
		title: post.title,
	};
}

function toPublicPostDetail(post: PostWithPublishedAt<PostDetailRecord>): PublicPostDetail {
	return {
		...toPublicPostListItem(post),
		content: post.content,
		readingTime: post.readingTime,
		tags: post.tags,
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
	return post && hasPublishedAt(post) ? toPublicPostDetail(post) : null;
}

export async function getPostsAdmin(): Promise<AdminPostListItem[]> {
	const posts = await findPostsAdmin();
	return posts.map((post) => ({
		...post,
		createdAt: post.createdAt.toISOString(),
	}));
}

export function calculateReadingTime(content: string): number {
	const wordCount = content.trim().split(/\s+/u).filter(Boolean).length;
	return Math.max(1, Math.ceil(wordCount / 200));
}

export async function createAdminPost(input: CreatePostInput): Promise<{ id: string; slug: string }> {
	const slug = await generateUniqueSlug(input.title, isPostSlugAvailable);
	const publishedAt = input.status === PublishStatus.PUBLISHED ? new Date() : null;

	return createPostRecord({
		...input,
		publishedAt,
		readingTime: calculateReadingTime(input.content),
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

	return updatePostRecord(id, {
		...input,
		publishedAt,
		readingTime: calculateReadingTime(input.content),
		slug,
	});
}

export async function deleteAdminPost(id: string): Promise<{ id: string } | null> {
	const existing = await findPostForAdmin(id);
	return existing ? deletePostRecord(id) : null;
}
