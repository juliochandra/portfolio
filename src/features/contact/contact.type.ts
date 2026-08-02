import type { ContactInfo } from "@/generated/prisma/client";

export type ContactInfoWriteInput = {
	icon: string | null;
	label: string;
	value: string;
};

export type ContactInfoListResponse = {
	data: ContactInfo[];
};

export type ContactInfoMutationResponse = {
	data: {
		id: string;
	};
};
