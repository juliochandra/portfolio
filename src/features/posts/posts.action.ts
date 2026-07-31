"use server";

import {
	adminPostsPageSchema,
	type CreatePostInput,
	createPostSchema,
	type GetPostsParams,
	getPostsParamsSchema,
	postIdSchema,
	postSlugSchema,
	type UpdatePostInput,
	updatePostSchema,
} from "@/features/posts/posts.schema";
import {
	createAdminPost,
	deleteAdminPost,
	getPostsAdmin as getAdminPosts,
	getPostsAdminPage as getAdminPostsPage,
	getPostAdminById,
	getPublishedPostBySlug,
	getPublishedPosts,
	type PublicPostDetail,
	type PublicPostListItem,
	updateAdminPost,
} from "@/features/posts/posts.services";
import { validateWithZod } from "@/lib/validation/zod";
import { getServerSession } from "@/shared/auth/server-session";

const INVALID_POST_PARAMS_MESSAGE = "Parameter tulisan tidak valid.";
const POST_NOT_FOUND_MESSAGE = "Tulisan tidak ditemukan.";
const UNAUTHORIZED = { error: { message: "UNAUTHORIZED" } } as const;

type GetPostsResult = { data: PublicPostListItem[] };

type GetPostBySlugResult = { data: PublicPostDetail } | { error: { message: string } };

type GetPostsAdminResult = { data: Awaited<ReturnType<typeof getAdminPosts>> } | { error: { message: "UNAUTHORIZED" } };

type GetPostsAdminPageResult = { data: Awaited<ReturnType<typeof getAdminPostsPage>> } | { error: { message: "UNAUTHORIZED" } };

type GetPostAdminResult =
	| { data: NonNullable<Awaited<ReturnType<typeof getPostAdminById>>> }
	| { error: { message: "Tulisan tidak ditemukan." | "UNAUTHORIZED" } };

type PostMutationResult =
	| { data: { id: string; slug: string } }
	| { error: { fields: Record<string, string> } }
	| { error: { message: "UNAUTHORIZED" } };

type DeletePostResult = { data: { id: string } } | { error: { message: "Tulisan tidak ditemukan." | "UNAUTHORIZED" } };

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

export async function getPostsAdmin(): Promise<GetPostsAdminResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	return { data: await getAdminPosts() };
}

export async function getPostsAdminPage(page: number): Promise<GetPostsAdminPageResult> {
	const session = await getServerSession();
	if (!session) return UNAUTHORIZED;

	const validation = validateWithZod(adminPostsPageSchema, page);
	const currentPage = validation.success ? validation.data : 1;
	return { data: await getAdminPostsPage(currentPage) };
}

export async function getPostAdmin(id: string): Promise<GetPostAdminResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}
	if (!validateWithZod(postIdSchema, id).success) {
		return { error: { message: POST_NOT_FOUND_MESSAGE } };
	}

	const post = await getPostAdminById(id);
	return post ? { data: post } : { error: { message: POST_NOT_FOUND_MESSAGE } };
}

export async function createPost(data: unknown): Promise<PostMutationResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	const validation = validateWithZod(createPostSchema, data);
	if (!validation.success) {
		return { error: { fields: validation.fields } };
	}

	return { data: await createAdminPost(validation.data as CreatePostInput) };
}

export async function updatePost(id: string, data: unknown): Promise<PostMutationResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}
	if (!validateWithZod(postIdSchema, id).success) {
		return { error: { fields: { _form: POST_NOT_FOUND_MESSAGE } } };
	}

	const validation = validateWithZod(updatePostSchema, data);
	if (!validation.success) {
		return { error: { fields: validation.fields } };
	}

	const post = await updateAdminPost(id, validation.data as UpdatePostInput);
	return post ? { data: post } : { error: { fields: { _form: POST_NOT_FOUND_MESSAGE } } };
}

export async function deletePost(id: string): Promise<DeletePostResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}
	if (!validateWithZod(postIdSchema, id).success) {
		return { error: { message: POST_NOT_FOUND_MESSAGE } };
	}

	const post = await deleteAdminPost(id);
	return post ? { data: post } : { error: { message: POST_NOT_FOUND_MESSAGE } };
}
