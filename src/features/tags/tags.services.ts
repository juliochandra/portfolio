import {
	createTagRecord,
	deleteTagRecord,
	findTagForAdmin,
	findTagsAdmin,
	isTagNameAvailable,
	isTagSlugAvailable,
	updateTagRecord,
} from "@/features/tags/tags.repository";
import { createTagSchema, updateTagSchema } from "@/features/tags/tags.schema";
import type { AdminTag, TagInput } from "@/features/tags/tags.type";
import { NotFoundException, ValidationException } from "@/lib/server-action-exception/exceptions";
import { generateUniqueSlug } from "@/lib/slug";
import { validateWithZod } from "@/lib/validation/zod";

export function getTagsAdmin(): Promise<AdminTag[]> {
	return findTagsAdmin();
}

export async function createAdminTag(input: TagInput): Promise<{ id: string }> {
	const validation = validateWithZod(createTagSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	if (!(await isTagNameAvailable(validation.data.name))) {
		throw new ValidationException({ name: "Nama tag sudah digunakan." });
	}

	const slug = await generateUniqueSlug(validation.data.name, isTagSlugAvailable, { maxLength: 60 });
	return createTagRecord({ ...validation.data, slug });
}

export async function updateAdminTag(id: string, input: TagInput): Promise<{ id: string }> {
	const validation = validateWithZod(updateTagSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const existing = await findTagForAdmin(id);
	if (!existing) {
		throw new NotFoundException("Tag tidak ditemukan.");
	}
	if (existing.name !== validation.data.name && !(await isTagNameAvailable(validation.data.name, id))) {
		throw new ValidationException({ name: "Nama tag sudah digunakan." });
	}
	const slug =
		existing.name === validation.data.name
			? existing.slug
			: await generateUniqueSlug(validation.data.name, (candidate) => isTagSlugAvailable(candidate, id), {
					maxLength: 60,
				});
	return updateTagRecord(id, { ...validation.data, slug });
}

export async function deleteAdminTag(id: string): Promise<{ id: string }> {
	const tag = await findTagForAdmin(id);
	if (!tag) {
		throw new NotFoundException("Tag tidak ditemukan.");
	}

	return deleteTagRecord(id);
}
