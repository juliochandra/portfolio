import type { Prisma, PublishStatus } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";

const postListSelect = {
	description: true,
	id: true,
	publishedAt: true,
	slug: true,
	thumbnailImage: true,
	title: true,
} satisfies Prisma.PostSelect;

const postDetailSelect = {
	...postListSelect,
	content: true,
	readingTime: true,
	tags: { select: { name: true } },
} satisfies Prisma.PostSelect;

export type PostListRecord = Prisma.PostGetPayload<{ select: typeof postListSelect }>;

export type PostDetailRecord = Prisma.PostGetPayload<{ select: typeof postDetailSelect }>;

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
