import {
	createSkillRecord,
	deleteSkillRecord,
	findSkillForAdmin,
	findSkills,
	findSkillsAdmin,
	isSkillNameAvailable,
	isSkillSlugAvailable,
	type SkillRecord,
	updateSkillRecord,
} from "@/features/skills/skills.repository";
import type { CreateSkillInput, UpdateSkillInput } from "@/features/skills/skills.schema";
import { generateUniqueSlug } from "@/shared/slug";

export type PublicSkill = {
	icon: string | null;
	id: string;
	name: string;
};

export type AdminSkillMutationResult = { id: string } | "name_taken" | null;

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

export async function getSkillsAdmin(): Promise<PublicSkill[]> {
	const skills = await findSkillsAdmin();
	return skills.map(toPublicSkill);
}

export async function createAdminSkill(input: CreateSkillInput): Promise<Exclude<AdminSkillMutationResult, null>> {
	if (!(await isSkillNameAvailable(input.name))) {
		return "name_taken";
	}

	const slug = await generateUniqueSlug(input.name, isSkillSlugAvailable, { maxLength: 60 });
	return createSkillRecord({ ...input, slug });
}

export async function updateAdminSkill(id: string, input: UpdateSkillInput): Promise<AdminSkillMutationResult> {
	const existing = await findSkillForAdmin(id);
	if (!existing) {
		return null;
	}
	if (existing.name !== input.name && !(await isSkillNameAvailable(input.name, id))) {
		return "name_taken";
	}

	const slug =
		existing.name === input.name
			? existing.slug
			: await generateUniqueSlug(input.name, (candidate) => isSkillSlugAvailable(candidate, id), { maxLength: 60 });
	return updateSkillRecord(id, { ...input, slug });
}

export async function deleteAdminSkill(id: string): Promise<{ id: string } | null> {
	const existing = await findSkillForAdmin(id);
	return existing ? deleteSkillRecord(id) : null;
}
