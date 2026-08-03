"use server";

import {
	createAdminSkill,
	deleteAdminSkill,
	getSkillsAdmin as getAdminSkills,
	getPublicSkills,
	updateAdminSkill,
} from "@/features/skills/skills.services";
import type { SkillInput, SkillMutationResponse, SkillsResponse } from "@/features/skills/skills.type";
import { requireServerSession } from "@/lib/auth/server-session";
import { toServerActionFailure } from "@/lib/server-action-exception/to-server-action-failure";
import type { ServerActionFailure } from "@/lib/server-action-exception/types";

export async function getSkills(): Promise<SkillsResponse | ServerActionFailure> {
	try {
		return { data: await getPublicSkills() };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getSkillsAdmin(): Promise<SkillsResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getAdminSkills() };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function createSkill(input: SkillInput): Promise<SkillMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await createAdminSkill(input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function updateSkill(id: string, input: SkillInput): Promise<SkillMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await updateAdminSkill(id, input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function deleteSkill(id: string): Promise<SkillMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await deleteAdminSkill(id) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}
