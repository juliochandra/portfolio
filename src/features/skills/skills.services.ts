import { findSkills, type SkillRecord } from "@/features/skills/skills.repository";

export type PublicSkill = {
	icon: string | null;
	id: string;
	name: string;
};

function toPublicSkill(skill: SkillRecord): PublicSkill {
	return {
		icon: skill.icon,
		id: skill.id,
		name: skill.name,
	};
}

export async function getPublicSkills(): Promise<PublicSkill[]> {
	const skills = await findSkills();
	return skills.map(toPublicSkill);
}
