import type { ContactInfoWriteInput } from "@/features/contact/contact.type";
import type { ContactInfo } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";

export function findContactInfo(): Promise<ContactInfo[]> {
	return prisma.contactInfo.findMany();
}

export function findContactInfoForAdmin(id: string): Promise<ContactInfo | null> {
	return prisma.contactInfo.findUnique({ where: { id } });
}

export function createContactInfoRecord(input: ContactInfoWriteInput): Promise<ContactInfo> {
	return prisma.contactInfo.create({ data: input });
}

export function updateContactInfoRecord(id: string, input: ContactInfoWriteInput): Promise<ContactInfo> {
	return prisma.contactInfo.update({ data: input, where: { id } });
}

export function deleteContactInfoRecord(id: string): Promise<ContactInfo> {
	return prisma.contactInfo.delete({ where: { id } });
}
