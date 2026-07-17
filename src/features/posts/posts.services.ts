import {
	findPostBySlug,
	findPosts,
	type PostDetailRecord,
	type PostListRecord,
} from "@/features/posts/posts.repository";
import { PublishStatus } from "@/generated/prisma/client";

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

type PostWithPublishedAt<TPost extends PostListRecord> = TPost & { publishedAt: Date };

function hasPublishedAt<TPost extends PostListRecord>(
	post: TPost,
): post is PostWithPublishedAt<TPost> {
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

export async function getPublishedPosts(params?: {
	limit?: number;
}): Promise<PublicPostListItem[]> {
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
