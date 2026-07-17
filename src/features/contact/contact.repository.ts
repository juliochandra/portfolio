import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";

const contactInfoSelect = {
	icon: true,
	id: true,
	label: true,
	value: true,
} satisfies Prisma.ContactInfoSelect;

export type ContactInfoRecord = Prisma.ContactInfoGetPayload<{ select: typeof contactInfoSelect }>;

export function findContactInfo(): Promise<ContactInfoRecord[]> {
	return prisma.contactInfo.findMany({ select: contactInfoSelect });
}
