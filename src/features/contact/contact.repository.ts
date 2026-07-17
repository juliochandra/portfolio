import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";

const contactInfoSelect = {
	icon: true,
	id: true,
	label: true,
	value: true,
} satisfies Prisma.ContactInfoSelect;

export type ContactInfoRecord = Prisma.ContactInfoGetPayload<{ select: typeof contactInfoSelect }>;

export type ContactInfoWriteInput = {
	icon: string | null;
	label: string;
	value: string;
};

const contactInfoMutationSelect = {
	id: true,
} satisfies Prisma.ContactInfoSelect;

export function findContactInfo(): Promise<ContactInfoRecord[]> {
	return prisma.contactInfo.findMany({ select: contactInfoSelect });
}

export function findContactInfoAdmin(): Promise<ContactInfoRecord[]> {
	return prisma.contactInfo.findMany({ select: contactInfoSelect });
}

export function findContactInfoForAdmin(id: string): Promise<{ id: string } | null> {
	return prisma.contactInfo.findUnique({
		select: contactInfoMutationSelect,
		where: { id },
	});
}

export function createContactInfoRecord(input: ContactInfoWriteInput): Promise<{ id: string }> {
	return prisma.contactInfo.create({
		data: input,
		select: contactInfoMutationSelect,
	});
}

export function updateContactInfoRecord(id: string, input: ContactInfoWriteInput): Promise<{ id: string }> {
	return prisma.contactInfo.update({
		data: input,
		select: contactInfoMutationSelect,
		where: { id },
	});
}

export function deleteContactInfoRecord(id: string): Promise<{ id: string }> {
	return prisma.contactInfo.delete({
		select: contactInfoMutationSelect,
		where: { id },
	});
}
