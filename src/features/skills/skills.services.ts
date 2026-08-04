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
import { createSkillSchema, updateSkillSchema } from "@/features/skills/skills.schema";
import type { PublicSkill, SkillInput } from "@/features/skills/skills.type";
import { NotFoundException, ValidationException } from "@/lib/server-action-exception/exceptions";
import { generateUniqueSlug } from "@/lib/slug";
import { validateWithZod } from "@/lib/validation/zod";

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

export async function createAdminSkill(input: SkillInput): Promise<{ id: string }> {
	const validation = validateWithZod(createSkillSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	if (!(await isSkillNameAvailable(validation.data.name))) {
		throw new ValidationException({ name: "Nama keahlian sudah digunakan." });
	}

	const slug = await generateUniqueSlug(validation.data.name, isSkillSlugAvailable, { maxLength: 60 });
	return createSkillRecord({ ...validation.data, slug });
}

export async function updateAdminSkill(id: string, input: SkillInput): Promise<{ id: string }> {
	const validation = validateWithZod(updateSkillSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const existing = await findSkillForAdmin(id);
	if (!existing) {
		throw new NotFoundException("Keahlian tidak ditemukan.");
	}
	if (existing.name !== validation.data.name && !(await isSkillNameAvailable(validation.data.name, id))) {
		throw new ValidationException({ name: "Nama keahlian sudah digunakan." });
	}

	const slug =
		existing.name === validation.data.name
			? existing.slug
			: await generateUniqueSlug(validation.data.name, (candidate) => isSkillSlugAvailable(candidate, id), {
					maxLength: 60,
				});
	return updateSkillRecord(id, { ...validation.data, slug });
}

export async function deleteAdminSkill(id: string): Promise<{ id: string }> {
	const existing = await findSkillForAdmin(id);
	if (!existing) {
		throw new NotFoundException("Keahlian tidak ditemukan.");
	}

	return deleteSkillRecord(id);
}
