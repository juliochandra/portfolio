export type SkillInput = {
	icon: string;
	name: string;
};

export type PublicSkill = {
	icon: string | null;
	id: string;
	name: string;
};

export type SkillsResponse = { data: PublicSkill[] };

export type SkillMutationResponse = { data: { id: string } };
