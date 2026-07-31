"use server";

import {
	type CreateContactInfoInput,
	contactInfoIdSchema,
	createContactInfoSchema,
	type UpdateContactInfoInput,
	updateContactInfoSchema,
} from "@/features/contact/contact.schema";
import {
	createAdminContactInfo,
	deleteAdminContactInfo,
	getContactInfoAdmin as getAdminContactInfo,
	getPublicContactInfo,
	type PublicContactInfo,
	updateAdminContactInfo,
} from "@/features/contact/contact.services";
import { getServerSession } from "@/lib/auth/server-session";
import { validateWithZod } from "@/lib/validation/zod";

type GetContactInfoResult = { data: PublicContactInfo[] };

const CONTACT_INFO_NOT_FOUND_MESSAGE = "Info kontak tidak ditemukan.";
const UNAUTHORIZED = { error: { message: "UNAUTHORIZED" } } as const;

type GetContactInfoAdminResult =
	| { data: Awaited<ReturnType<typeof getAdminContactInfo>> }
	| { error: { message: "UNAUTHORIZED" } };

type ContactInfoMutationResult =
	| { data: { id: string } }
	| { error: { fields: Record<string, string> } }
	| { error: { message: "UNAUTHORIZED" } };

type DeleteContactInfoResult =
	| { data: { id: string } }
	| { error: { message: "Info kontak tidak ditemukan." | "UNAUTHORIZED" } };

export async function getContactInfo(): Promise<GetContactInfoResult> {
	return { data: await getPublicContactInfo() };
}

export async function getContactInfoAdmin(): Promise<GetContactInfoAdminResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	return { data: await getAdminContactInfo() };
}

export async function createContactInfo(data: unknown): Promise<ContactInfoMutationResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	const validation = validateWithZod(createContactInfoSchema, data);
	if (!validation.success) {
		return { error: { fields: validation.fields } };
	}

	return { data: await createAdminContactInfo(validation.data as CreateContactInfoInput) };
}

export async function updateContactInfo(id: string, data: unknown): Promise<ContactInfoMutationResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}
	if (!validateWithZod(contactInfoIdSchema, id).success) {
		return { error: { fields: { _form: CONTACT_INFO_NOT_FOUND_MESSAGE } } };
	}

	const validation = validateWithZod(updateContactInfoSchema, data);
	if (!validation.success) {
		return { error: { fields: validation.fields } };
	}

	const contactInfo = await updateAdminContactInfo(id, validation.data as UpdateContactInfoInput);
	return contactInfo ? { data: contactInfo } : { error: { fields: { _form: CONTACT_INFO_NOT_FOUND_MESSAGE } } };
}

export async function deleteContactInfo(id: string): Promise<DeleteContactInfoResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}
	if (!validateWithZod(contactInfoIdSchema, id).success) {
		return { error: { message: CONTACT_INFO_NOT_FOUND_MESSAGE } };
	}

	const contactInfo = await deleteAdminContactInfo(id);
	return contactInfo ? { data: contactInfo } : { error: { message: CONTACT_INFO_NOT_FOUND_MESSAGE } };
}
