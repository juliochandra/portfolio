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
import {
	adminPostsPageSchema,
	createPostSchema,
	getPostsParamsSchema,
	postSlugSchema,
	updatePostSchema,
} from "@/features/posts/posts.schema";
import type {
	AdminPostDetail,
	AdminPostListItem,
	AdminPostListPage,
	GetPostsParams,
	PostInput,
	PublicPostDetail,
	PublicPostListItem,
	PublicPostNavigationItem,
} from "@/features/posts/posts.type";
import { PublishStatus, toPublishStatus } from "@/lib/publish-status";
import { NotFoundException, ValidationException } from "@/lib/server-action-exception/exceptions";
import { generateUniqueSlug } from "@/lib/slug";
import {
	emptyRichTextDocument,
	parseRichTextDocument,
	richTextDocumentToPlainText,
	serializeRichTextDocument,
} from "@/lib/tiptap/json";
import { validateWithZod } from "@/lib/validation/zod";

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
		content: parseRichTextDocument(post.content) ?? emptyRichTextDocument,
		nextPost,
		prevPost: previousPost,
	};
}

export async function getPublishedPosts(params?: GetPostsParams): Promise<PublicPostListItem[]> {
	const validation = validateWithZod(getPostsParamsSchema, params);
	if (!validation.success) {
		throw new ValidationException(validation.fields, "Parameter tulisan tidak valid.");
	}

	const posts = await findPosts({
		limit: validation.data?.limit,
		status: PublishStatus.PUBLISHED,
	});
	return posts.filter(hasPublishedAt).map(toPublicPostListItem);
}

export async function getPublishedPostBySlug(slug: string): Promise<PublicPostDetail> {
	const validation = validateWithZod(postSlugSchema, slug);
	if (!validation.success) {
		throw new NotFoundException("Tulisan tidak ditemukan.");
	}

	const post = await findPostBySlug({ slug: validation.data, status: PublishStatus.PUBLISHED });
	if (!post || !hasPublishedAt(post)) {
		throw new NotFoundException("Tulisan tidak ditemukan.");
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

export async function getPostsAdminPage(page: number): Promise<AdminPostListPage> {
	const validation = validateWithZod(adminPostsPageSchema, page);
	if (!validation.success) {
		throw new ValidationException(validation.fields, "Halaman tulisan tidak valid.");
	}

	const totalPosts = await countPostsAdmin();
	const totalPages = Math.max(1, Math.ceil(totalPosts / ADMIN_POSTS_PER_PAGE));
	const currentPage = Math.min(validation.data, totalPages);
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

export async function getPostAdminById(id: string): Promise<AdminPostDetail> {
	const post = await findPostDetailForAdmin(id);
	if (!post) {
		throw new NotFoundException("Tulisan tidak ditemukan.");
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

export async function createAdminPost(input: PostInput): Promise<{ id: string; slug: string }> {
	const validation = validateWithZod(createPostSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const slug = await generateUniqueSlug(validation.data.title, isPostSlugAvailable);
	const publishedAt = validation.data.status === PublishStatus.PUBLISHED ? new Date() : null;
	const content = serializeRichTextDocument(validation.data.content);

	return createPostRecord({
		...validation.data,
		content,
		publishedAt,
		readingTime: calculateReadingTime(richTextDocumentToPlainText(validation.data.content)),
		slug,
	});
}

export async function updateAdminPost(id: string, input: PostInput): Promise<{ id: string; slug: string }> {
	const validation = validateWithZod(updatePostSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const existing = await findPostForAdmin(id);
	if (!existing) {
		throw new NotFoundException("Tulisan tidak ditemukan.");
	}

	const slug =
		existing.title === validation.data.title
			? existing.slug
			: await generateUniqueSlug(validation.data.title, (candidate) => isPostSlugAvailable(candidate, id));
	const publishedAt = existing.publishedAt ?? (validation.data.status === PublishStatus.PUBLISHED ? new Date() : null);
	const content = serializeRichTextDocument(validation.data.content);

	return updatePostRecord(id, {
		...validation.data,
		content,
		publishedAt,
		readingTime: calculateReadingTime(richTextDocumentToPlainText(validation.data.content)),
		slug,
	});
}

export async function deleteAdminPost(id: string): Promise<{ id: string }> {
	const existing = await findPostForAdmin(id);
	if (!existing) {
		throw new NotFoundException("Tulisan tidak ditemukan.");
	}

	return deletePostRecord(id);
}
