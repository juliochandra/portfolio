import { type ContactInfoRecord, findContactInfo } from "@/features/contact/contact.repository";

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
