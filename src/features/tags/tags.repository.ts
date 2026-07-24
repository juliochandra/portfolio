import type { Prisma } from "@prisma/client";
import { prisma } from "@/shared/database/prisma";

const tagListSelect = {
	id: true,
	name: true,
} satisfies Prisma.TagSelect;

const tagAdminSelect = {
	id: true,
	name: true,
	slug: true,
} satisfies Prisma.TagSelect;

const tagMutationSelect = {
	id: true,
} satisfies Prisma.TagSelect;

export type TagListRecord = Prisma.TagGetPayload<{ select: typeof tagListSelect }>;
export type TagAdminRecord = Prisma.TagGetPayload<{ select: typeof tagAdminSelect }>;
export type TagWriteInput = { name: string; slug: string };

export function findTagsAdmin(): Promise<TagListRecord[]> {
	return prisma.tag.findMany({ select: tagListSelect });
}

export function findTagForAdmin(id: string): Promise<TagAdminRecord | null> {
	return prisma.tag.findUnique({ select: tagAdminSelect, where: { id } });
}

export async function isTagNameAvailable(name: string, excludeId?: string): Promise<boolean> {
	const tag = await prisma.tag.findUnique({ select: { id: true }, where: { name } });
	return !tag || tag.id === excludeId;
}

export async function isTagSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
	const tag = await prisma.tag.findUnique({ select: { id: true }, where: { slug } });
	return !tag || tag.id === excludeId;
}

export function createTagRecord(input: TagWriteInput): Promise<{ id: string }> {
	return prisma.tag.create({ data: input, select: tagMutationSelect });
}

export function updateTagRecord(id: string, input: TagWriteInput): Promise<{ id: string }> {
	return prisma.tag.update({ data: input, select: tagMutationSelect, where: { id } });
}

export function deleteTagRecord(id: string): Promise<{ id: string }> {
	return prisma.tag.delete({ select: tagMutationSelect, where: { id } });
}
