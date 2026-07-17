import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";

const publicSkillSelect = {
	icon: true,
	id: true,
	name: true,
} satisfies Prisma.SkillSelect;

export type SkillRecord = Prisma.SkillGetPayload<{ select: typeof publicSkillSelect }>;

export function findSkills(): Promise<SkillRecord[]> {
	return prisma.skill.findMany({ select: publicSkillSelect });
}
