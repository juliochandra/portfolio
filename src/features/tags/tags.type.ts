export type TagInput = {
	name: string;
};

export type AdminTag = {
	id: string;
	name: string;
};

export type TagsResponse = { data: AdminTag[] };

export type TagMutationResponse = { data: { id: string } };
