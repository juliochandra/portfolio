"use server";

import {
	type CreateSkillInput,
	createSkillSchema,
	skillIdSchema,
	type UpdateSkillInput,
	updateSkillSchema,
} from "@/features/skills/skills.schema";
import {
	createAdminSkill,
	deleteAdminSkill,
	getSkillsAdmin as getAdminSkills,
	getPublicSkills,
	type PublicSkill,
	updateAdminSkill,
} from "@/features/skills/skills.services";
import { validateWithZod } from "@/lib/validation/zod";
import { getServerSession } from "@/shared/auth/server-session";

type GetSkillsResult = { data: PublicSkill[] };

const SKILL_NOT_FOUND_MESSAGE = "Keahlian tidak ditemukan.";
const SKILL_NAME_TAKEN_MESSAGE = "Nama keahlian sudah digunakan.";
const UNAUTHORIZED = { error: { message: "UNAUTHORIZED" } } as const;

type GetSkillsAdminResult = { data: Awaited<ReturnType<typeof getAdminSkills>> } | { error: { message: "UNAUTHORIZED" } };

type SkillMutationResult =
	| { data: { id: string } }
	| { error: { fields: Record<string, string> } }
	| { error: { message: "UNAUTHORIZED" } };

type DeleteSkillResult = { data: { id: string } } | { error: { message: "Keahlian tidak ditemukan." | "UNAUTHORIZED" } };

export async function getSkills(): Promise<GetSkillsResult> {
	return { data: await getPublicSkills() };
}

export async function getSkillsAdmin(): Promise<GetSkillsAdminResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	return { data: await getAdminSkills() };
}

export async function createSkill(data: unknown): Promise<SkillMutationResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	const validation = validateWithZod(createSkillSchema, data);
	if (!validation.success) {
		return { error: { fields: validation.fields } };
	}

	const skill = await createAdminSkill(validation.data as CreateSkillInput);
	return skill === "name_taken" ? { error: { fields: { name: SKILL_NAME_TAKEN_MESSAGE } } } : { data: skill };
}

export async function updateSkill(id: string, data: unknown): Promise<SkillMutationResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}
	if (!validateWithZod(skillIdSchema, id).success) {
		return { error: { fields: { _form: SKILL_NOT_FOUND_MESSAGE } } };
	}

	const validation = validateWithZod(updateSkillSchema, data);
	if (!validation.success) {
		return { error: { fields: validation.fields } };
	}

	const skill = await updateAdminSkill(id, validation.data as UpdateSkillInput);
	if (skill === "name_taken") {
		return { error: { fields: { name: SKILL_NAME_TAKEN_MESSAGE } } };
	}
	return skill ? { data: skill } : { error: { fields: { _form: SKILL_NOT_FOUND_MESSAGE } } };
}

export async function deleteSkill(id: string): Promise<DeleteSkillResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}
	if (!validateWithZod(skillIdSchema, id).success) {
		return { error: { message: SKILL_NOT_FOUND_MESSAGE } };
	}

	const skill = await deleteAdminSkill(id);
	return skill ? { data: skill } : { error: { message: SKILL_NOT_FOUND_MESSAGE } };
}
