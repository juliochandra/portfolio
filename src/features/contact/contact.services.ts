import {
	createContactInfoRecord,
	deleteContactInfoRecord,
	findContactInfo,
	findContactInfoForAdmin,
	updateContactInfoRecord,
} from "@/features/contact/contact.repository";
import { createContactInfoSchema, updateContactInfoSchema } from "@/features/contact/contact.schema";
import type { ContactInfoWriteInput } from "@/features/contact/contact.type";
import type { ContactInfo } from "@/generated/prisma/client";
import { NotFoundException, ValidationException } from "@/lib/server-action-exception/exceptions";
import { validateWithZod } from "@/lib/validation/zod";

export function getPublicContactInfo(): Promise<ContactInfo[]> {
	return findContactInfo();
}

export function getContactInfoAdmin(): Promise<ContactInfo[]> {
	return findContactInfo();
}

export async function createAdminContactInfo(input: ContactInfoWriteInput): Promise<ContactInfo> {
	const validation = validateWithZod(createContactInfoSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const contactInfo = await createContactInfoRecord(validation.data);
	return contactInfo;
}

export async function updateAdminContactInfo(id: string, input: ContactInfoWriteInput): Promise<ContactInfo> {
	const validation = validateWithZod(updateContactInfoSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const existing = await findContactInfoForAdmin(id);
	if (!existing) {
		throw new NotFoundException("Info kontak tidak ditemukan.");
	}

	return updateContactInfoRecord(id, validation.data);
}

export async function deleteAdminContactInfo(id: string): Promise<ContactInfo> {
	const existing = await findContactInfoForAdmin(id);
	if (!existing) {
		throw new NotFoundException("Info kontak tidak ditemukan.");
	}

	return deleteContactInfoRecord(id);
}
