"use server";

import { getPublicSkills, type PublicSkill } from "@/features/skills/skills.services";

type GetSkillsResult = { data: PublicSkill[] };

export async function getSkills(): Promise<GetSkillsResult> {
	return { data: await getPublicSkills() };
}
