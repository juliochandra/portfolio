import {
	createTagRecord,
	deleteTagRecord,
	findTagForAdmin,
	findTagsAdmin,
	isTagNameAvailable,
	isTagSlugAvailable,
	updateTagRecord,
} from "@/features/tags/tags.repository";
import type { CreateTagInput, UpdateTagInput } from "@/features/tags/tags.schema";
import { generateUniqueSlug } from "@/lib/slug";

export type AdminTagMutationResult = { id: string } | "name_taken" | null;

export function getTagsAdmin(): Promise<{ id: string; name: string }[]> {
	return findTagsAdmin();
}

export async function createAdminTag(input: CreateTagInput): Promise<Exclude<AdminTagMutationResult, null>> {
	if (!(await isTagNameAvailable(input.name))) return "name_taken";
	const slug = await generateUniqueSlug(input.name, isTagSlugAvailable, { maxLength: 60 });
	return createTagRecord({ ...input, slug });
}

export async function updateAdminTag(id: string, input: UpdateTagInput): Promise<AdminTagMutationResult> {
	const existing = await findTagForAdmin(id);
	if (!existing) return null;
	if (existing.name !== input.name && !(await isTagNameAvailable(input.name, id))) return "name_taken";
	const slug =
		existing.name === input.name
			? existing.slug
			: await generateUniqueSlug(input.name, (candidate) => isTagSlugAvailable(candidate, id), { maxLength: 60 });
	return updateTagRecord(id, { ...input, slug });
}

export async function deleteAdminTag(id: string): Promise<{ id: string } | null> {
	return (await findTagForAdmin(id)) ? deleteTagRecord(id) : null;
}
