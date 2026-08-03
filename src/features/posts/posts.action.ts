"use server";

import {
	createAdminPost,
	deleteAdminPost,
	getPostsAdmin as getAdminPosts,
	getPostsAdminPage as getAdminPostsPage,
	getPostAdminById,
	getPublishedPostBySlug,
	getPublishedPosts,
	updateAdminPost,
} from "@/features/posts/posts.services";
import type {
	DeletePostResponse,
	GetPostAdminResponse,
	GetPostBySlugResponse,
	GetPostsAdminPageResponse,
	GetPostsAdminResponse,
	GetPostsParams,
	GetPostsResponse,
	PostInput,
	PostMutationResponse,
} from "@/features/posts/posts.type";
import { requireServerSession } from "@/lib/auth/server-session";
import { toServerActionFailure } from "@/lib/server-action-exception/to-server-action-failure";
import type { ServerActionFailure } from "@/lib/server-action-exception/types";

export async function getPosts(params?: GetPostsParams): Promise<GetPostsResponse | ServerActionFailure> {
	try {
		return { data: await getPublishedPosts(params) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getPostBySlug(slug: string): Promise<GetPostBySlugResponse | ServerActionFailure> {
	try {
		return { data: await getPublishedPostBySlug(slug) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getPostsAdmin(): Promise<GetPostsAdminResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getAdminPosts() };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getPostsAdminPage(page: number): Promise<GetPostsAdminPageResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getAdminPostsPage(page) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getPostAdmin(id: string): Promise<GetPostAdminResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getPostAdminById(id) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function createPost(input: PostInput): Promise<PostMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await createAdminPost(input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function updatePost(id: string, input: PostInput): Promise<PostMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await updateAdminPost(id, input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function deletePost(id: string): Promise<DeletePostResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await deleteAdminPost(id) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}
