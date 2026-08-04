"use server";

import { createAdminTag, deleteAdminTag, getTagsAdmin as getAdminTags, updateAdminTag } from "@/features/tags/tags.services";
import type { TagInput, TagMutationResponse, TagsResponse } from "@/features/tags/tags.type";
import { requireServerSession } from "@/lib/auth/server-session";
import { toServerActionFailure } from "@/lib/server-action-exception/to-server-action-failure";
import type { ServerActionFailure } from "@/lib/server-action-exception/types";

export async function getTagsAdmin(): Promise<TagsResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getAdminTags() };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function createTag(input: TagInput): Promise<TagMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await createAdminTag(input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function updateTag(id: string, input: TagInput): Promise<TagMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await updateAdminTag(id, input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function deleteTag(id: string): Promise<TagMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await deleteAdminTag(id) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}
