import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";

const publicSkillSelect = {
	icon: true,
	id: true,
	name: true,
} satisfies Prisma.SkillSelect;

export type SkillRecord = Prisma.SkillGetPayload<{ select: typeof publicSkillSelect }>;

const adminSkillSelect = {
	id: true,
	name: true,
	slug: true,
} satisfies Prisma.SkillSelect;

const skillMutationSelect = {
	id: true,
} satisfies Prisma.SkillSelect;

export type AdminSkillRecord = Prisma.SkillGetPayload<{ select: typeof adminSkillSelect }>;

export type SkillWriteInput = {
	icon: string;
	name: string;
	slug: string;
};

export function findSkills(): Promise<SkillRecord[]> {
	return prisma.skill.findMany({ select: publicSkillSelect });
}

export function findSkillsAdmin(): Promise<SkillRecord[]> {
	return prisma.skill.findMany({ select: publicSkillSelect });
}

export function findSkillForAdmin(id: string): Promise<AdminSkillRecord | null> {
	return prisma.skill.findUnique({
		select: adminSkillSelect,
		where: { id },
	});
}

export async function isSkillNameAvailable(name: string, excludeId?: string): Promise<boolean> {
	const skill = await prisma.skill.findUnique({
		select: { id: true },
		where: { name },
	});
	return !skill || skill.id === excludeId;
}

export async function isSkillSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
	const skill = await prisma.skill.findUnique({
		select: { id: true },
		where: { slug },
	});
	return !skill || skill.id === excludeId;
}

export function createSkillRecord(input: SkillWriteInput): Promise<{ id: string }> {
	return prisma.skill.create({
		data: input,
		select: skillMutationSelect,
	});
}

export function updateSkillRecord(id: string, input: SkillWriteInput): Promise<{ id: string }> {
	return prisma.skill.update({
		data: input,
		select: skillMutationSelect,
		where: { id },
	});
}

export function deleteSkillRecord(id: string): Promise<{ id: string }> {
	return prisma.skill.delete({
		select: skillMutationSelect,
		where: { id },
	});
}
