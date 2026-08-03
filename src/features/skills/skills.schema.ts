import { z } from "zod";
import type { SkillInput } from "@/features/skills/skills.type";

const REQUIRED_MESSAGE = "Wajib diisi.";

const requiredText = (maxLength: number) => z.string().trim().min(1, REQUIRED_MESSAGE).max(maxLength);

const requiredUrl = (maxLength: number) =>
	z
		.string()
		.trim()
		.min(1, REQUIRED_MESSAGE)
		.max(maxLength)
		.refine((value) => z.url().safeParse(value).success, "URL ikon tidak valid.");

const skillInputSchema = z.object({
	icon: requiredUrl(255),
	name: requiredText(50),
});

export const createSkillSchema = skillInputSchema;
export const updateSkillSchema = skillInputSchema;

function readString(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === "string" ? value : "";
}

export function skillFormDataToInput(formData: FormData): SkillInput {
	return {
		icon: readString(formData, "icon"),
		name: readString(formData, "name"),
	};
}
