import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";
import { PublishStatus } from "@/lib/publish-status";

const postListSelect = {
	description: true,
	id: true,
	publishedAt: true,
	readingTime: true,
	slug: true,
	tags: { select: { name: true } },
	thumbnailImage: true,
	title: true,
} satisfies Prisma.PostSelect;

const postDetailSelect = {
	...postListSelect,
	content: true,
} satisfies Prisma.PostSelect;

const postNavigationSelect = {
	slug: true,
	title: true,
} satisfies Prisma.PostSelect;

const adminPostListSelect = {
	createdAt: true,
	id: true,
	status: true,
	title: true,
} satisfies Prisma.PostSelect;

const adminPostSelect = {
	publishedAt: true,
	slug: true,
	title: true,
} satisfies Prisma.PostSelect;

const adminPostDetailSelect = {
	content: true,
	description: true,
	id: true,
	status: true,
	tags: { select: { id: true } },
	thumbnailImage: true,
	title: true,
} satisfies Prisma.PostSelect;

export type PostListRecord = Prisma.PostGetPayload<{ select: typeof postListSelect }>;

export type PostDetailRecord = Prisma.PostGetPayload<{ select: typeof postDetailSelect }>;

export type PostNavigationRecord = Prisma.PostGetPayload<{ select: typeof postNavigationSelect }>;

export type AdminPostListRecord = Prisma.PostGetPayload<{ select: typeof adminPostListSelect }>;

export type AdminPostRecord = Prisma.PostGetPayload<{ select: typeof adminPostSelect }>;

export type AdminPostDetailRecord = Prisma.PostGetPayload<{ select: typeof adminPostDetailSelect }>;

export type PostWriteInput = {
	content: string;
	description: string | null;
	publishedAt: Date | null;
	readingTime: number;
	slug: string;
	status: PublishStatus;
	tagIds: string[];
	thumbnailImage: string | null;
	title: string;
};

export function findPosts(params: { limit?: number; status: PublishStatus }): Promise<PostListRecord[]> {
	return prisma.post.findMany({
		orderBy: { publishedAt: "desc" },
		select: postListSelect,
		take: params.limit,
		where: { status: params.status },
	});
}

export function findPostBySlug(params: { slug: string; status: PublishStatus }): Promise<PostDetailRecord | null> {
	return prisma.post.findFirst({
		select: postDetailSelect,
		where: { slug: params.slug, status: params.status },
	});
}

export function findPreviousPublishedPost(params: { publishedAt: Date }): Promise<PostNavigationRecord | null> {
	return prisma.post.findFirst({
		orderBy: { publishedAt: "asc" },
		select: postNavigationSelect,
		where: {
			publishedAt: { gt: params.publishedAt },
			status: PublishStatus.PUBLISHED,
		},
	});
}

export function findNextPublishedPost(params: { publishedAt: Date }): Promise<PostNavigationRecord | null> {
	return prisma.post.findFirst({
		orderBy: { publishedAt: "desc" },
		select: postNavigationSelect,
		where: {
			publishedAt: { lt: params.publishedAt },
			status: PublishStatus.PUBLISHED,
		},
	});
}

export function findPostsAdmin(params?: { skip: number; take: number }): Promise<AdminPostListRecord[]> {
	return prisma.post.findMany({
		orderBy: { createdAt: "desc" },
		select: adminPostListSelect,
		skip: params?.skip,
		take: params?.take,
	});
}

export function countPostsAdmin(): Promise<number> {
	return prisma.post.count();
}

export function findPostForAdmin(id: string): Promise<AdminPostRecord | null> {
	return prisma.post.findUnique({
		select: adminPostSelect,
		where: { id },
	});
}

export function findPostDetailForAdmin(id: string): Promise<AdminPostDetailRecord | null> {
	return prisma.post.findUnique({
		select: adminPostDetailSelect,
		where: { id },
	});
}

export async function isPostSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
	const post = await prisma.post.findUnique({
		select: { id: true },
		where: { slug },
	});
	return !post || post.id === excludeId;
}

function postRelations(input: PostWriteInput): Pick<Prisma.PostCreateInput, "tags"> {
	return {
		tags: { connect: input.tagIds.map((id) => ({ id })) },
	};
}

function postUpdateRelations(input: PostWriteInput): Pick<Prisma.PostUpdateInput, "tags"> {
	return {
		tags: { set: input.tagIds.map((id) => ({ id })) },
	};
}

const mutationResultSelect = {
	id: true,
	slug: true,
} satisfies Prisma.PostSelect;

export function createPostRecord(input: PostWriteInput): Promise<{ id: string; slug: string }> {
	return prisma.post.create({
		data: {
			...postRelations(input),
			content: input.content,
			description: input.description,
			publishedAt: input.publishedAt,
			readingTime: input.readingTime,
			slug: input.slug,
			status: input.status,
			thumbnailImage: input.thumbnailImage,
			title: input.title,
		},
		select: mutationResultSelect,
	});
}

export function updatePostRecord(id: string, input: PostWriteInput): Promise<{ id: string; slug: string }> {
	return prisma.post.update({
		data: {
			...postUpdateRelations(input),
			content: input.content,
			description: input.description,
			publishedAt: input.publishedAt,
			readingTime: input.readingTime,
			slug: input.slug,
			status: input.status,
			thumbnailImage: input.thumbnailImage,
			title: input.title,
		},
		select: mutationResultSelect,
		where: { id },
	});
}

export function deletePostRecord(id: string): Promise<{ id: string }> {
	return prisma.post.delete({
		select: { id: true },
		where: { id },
	});
}
