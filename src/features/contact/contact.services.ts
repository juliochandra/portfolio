import {
	type ContactInfoRecord,
	createContactInfoRecord,
	deleteContactInfoRecord,
	findContactInfo,
	findContactInfoAdmin,
	findContactInfoForAdmin,
	updateContactInfoRecord,
} from "@/features/contact/contact.repository";
import type { CreateContactInfoInput, UpdateContactInfoInput } from "@/features/contact/contact.schema";

export type PublicContactInfo = {
	icon: string | null;
	id: string;
	label: string;
	value: string;
};

function toPublicContactInfo(contactInfo: ContactInfoRecord): PublicContactInfo {
	return {
		icon: contactInfo.icon,
		id: contactInfo.id,
		label: contactInfo.label,
		value: contactInfo.value,
	};
}

export async function getPublicContactInfo(): Promise<PublicContactInfo[]> {
	const contactInfo = await findContactInfo();
	return contactInfo.map(toPublicContactInfo);
}

export async function getContactInfoAdmin(): Promise<PublicContactInfo[]> {
	const contactInfo = await findContactInfoAdmin();
	return contactInfo.map(toPublicContactInfo);
}

export function createAdminContactInfo(input: CreateContactInfoInput): Promise<{ id: string }> {
	return createContactInfoRecord(input);
}

export async function updateAdminContactInfo(id: string, input: UpdateContactInfoInput): Promise<{ id: string } | null> {
	const existing = await findContactInfoForAdmin(id);
	return existing ? updateContactInfoRecord(id, input) : null;
}

export async function deleteAdminContactInfo(id: string): Promise<{ id: string } | null> {
	const existing = await findContactInfoForAdmin(id);
	return existing ? deleteContactInfoRecord(id) : null;
}
