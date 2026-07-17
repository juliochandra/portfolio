import type { MessageStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";

const createdMessageSelect = {
	id: true,
} satisfies Prisma.MessageSelect;

export type CreatedMessageRecord = Prisma.MessageGetPayload<{ select: typeof createdMessageSelect }>;

export function createMessage(input: {
	email: string;
	message: string;
	name: string;
	status: MessageStatus;
}): Promise<CreatedMessageRecord> {
	return prisma.message.create({
		data: input,
		select: createdMessageSelect,
	});
}
