"use server";

import {
	type CreateTagInput,
	createTagSchema,
	tagIdSchema,
	type UpdateTagInput,
	updateTagSchema,
} from "@/features/tags/tags.schema";
import { createAdminTag, deleteAdminTag, getTagsAdmin as getAdminTags, updateAdminTag } from "@/features/tags/tags.services";
import { getServerSession } from "@/lib/auth/server-session";
import { validateWithZod } from "@/lib/validation/zod";

const TAG_NOT_FOUND_MESSAGE = "Tag tidak ditemukan.";
const TAG_NAME_TAKEN_MESSAGE = "Nama tag sudah digunakan.";
const UNAUTHORIZED = { error: { message: "UNAUTHORIZED" } } as const;

type GetTagsAdminResult = { data: Awaited<ReturnType<typeof getAdminTags>> } | { error: { message: "UNAUTHORIZED" } };
type TagMutationResult =
	| { data: { id: string } }
	| { error: { fields: Record<string, string> } }
	| { error: { message: "UNAUTHORIZED" } };
type DeleteTagResult = { data: { id: string } } | { error: { message: "Tag tidak ditemukan." | "UNAUTHORIZED" } };

export async function getTagsAdmin(): Promise<GetTagsAdminResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	return { data: await getAdminTags() };
}

export async function createTag(data: unknown): Promise<TagMutationResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	const validation = validateWithZod(createTagSchema, data);
	if (!validation.success) return { error: { fields: validation.fields } };
	const tag = await createAdminTag(validation.data as CreateTagInput);
	return tag === "name_taken" ? { error: { fields: { name: TAG_NAME_TAKEN_MESSAGE } } } : { data: tag };
}

export async function updateTag(id: string, data: unknown): Promise<TagMutationResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	if (!validateWithZod(tagIdSchema, id).success) return { error: { fields: { _form: TAG_NOT_FOUND_MESSAGE } } };
	const validation = validateWithZod(updateTagSchema, data);
	if (!validation.success) return { error: { fields: validation.fields } };
	const tag = await updateAdminTag(id, validation.data as UpdateTagInput);
	if (tag === "name_taken") return { error: { fields: { name: TAG_NAME_TAKEN_MESSAGE } } };
	return tag ? { data: tag } : { error: { fields: { _form: TAG_NOT_FOUND_MESSAGE } } };
}

export async function deleteTag(id: string): Promise<DeleteTagResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	if (!validateWithZod(tagIdSchema, id).success) return { error: { message: TAG_NOT_FOUND_MESSAGE } };
	const tag = await deleteAdminTag(id);
	return tag ? { data: tag } : { error: { message: TAG_NOT_FOUND_MESSAGE } };
}
