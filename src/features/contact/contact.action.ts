"use server";

import {
	createAdminContactInfo,
	deleteAdminContactInfo,
	getContactInfoAdmin as getAdminContactInfo,
	getPublicContactInfo,
	updateAdminContactInfo,
} from "@/features/contact/contact.services";
import type {
	ContactInfoListResponse,
	ContactInfoMutationResponse,
	ContactInfoWriteInput,
} from "@/features/contact/contact.type";
import { requireServerSession } from "@/lib/auth/server-session";
import { toServerActionFailure } from "@/lib/server-action-exception/to-server-action-failure";
import type { ServerActionFailure } from "@/lib/server-action-exception/types";

export async function getContactInfo(): Promise<ContactInfoListResponse | ServerActionFailure> {
	try {
		return { data: await getPublicContactInfo() };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getContactInfoAdmin(): Promise<ContactInfoListResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getAdminContactInfo() };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function createContactInfo(
	input: ContactInfoWriteInput,
): Promise<ContactInfoMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		const contactInfo = await createAdminContactInfo(input);
		return { data: { id: contactInfo.id } };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function updateContactInfo(
	id: string,
	input: ContactInfoWriteInput,
): Promise<ContactInfoMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		const contactInfo = await updateAdminContactInfo(id, input);
		return { data: { id: contactInfo.id } };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function deleteContactInfo(id: string): Promise<ContactInfoMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		const contactInfo = await deleteAdminContactInfo(id);
		return { data: { id: contactInfo.id } };
	} catch (error) {
		return toServerActionFailure(error);
	}
}
