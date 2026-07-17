"use server";

import { type GetPostsParams, getPostsParamsSchema, postSlugSchema } from "@/features/posts/posts.schema";
import {
	getPublishedPostBySlug,
	getPublishedPosts,
	type PublicPostDetail,
	type PublicPostListItem,
} from "@/features/posts/posts.services";
import { validateWithZod } from "@/shared/validation/zod";

const INVALID_POST_PARAMS_MESSAGE = "Parameter tulisan tidak valid.";
const POST_NOT_FOUND_MESSAGE = "Tulisan tidak ditemukan.";

type GetPostsResult = { data: PublicPostListItem[] };

type GetPostBySlugResult = { data: PublicPostDetail } | { error: { message: string } };

export async function getPosts(params?: GetPostsParams): Promise<GetPostsResult> {
	const validation = validateWithZod(getPostsParamsSchema, params);
	if (!validation.success) {
		throw new Error(INVALID_POST_PARAMS_MESSAGE);
	}

	return {
		data: await getPublishedPosts(validation.data),
	};
}

export async function getPostBySlug(slug: string): Promise<GetPostBySlugResult> {
	const validation = validateWithZod(postSlugSchema, slug);
	if (!validation.success) {
		return { error: { message: POST_NOT_FOUND_MESSAGE } };
	}

	const post = await getPublishedPostBySlug(validation.data);
	return post ? { data: post } : { error: { message: POST_NOT_FOUND_MESSAGE } };
}
