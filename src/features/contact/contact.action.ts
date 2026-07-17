"use server";

import { getPublicContactInfo, type PublicContactInfo } from "@/features/contact/contact.services";

type GetContactInfoResult = { data: PublicContactInfo[] };

export async function getContactInfo(): Promise<GetContactInfoResult> {
	return { data: await getPublicContactInfo() };
}
