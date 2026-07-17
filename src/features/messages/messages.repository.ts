import type { MessageStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";

const createdMessageSelect = {
	id: true,
} satisfies Prisma.MessageSelect;

const messageListSelect = {
	createdAt: true,
	email: true,
	id: true,
	message: true,
	name: true,
	status: true,
} satisfies Prisma.MessageSelect;

const messageStatusSelect = {
	id: true,
	status: true,
} satisfies Prisma.MessageSelect;

export type CreatedMessageRecord = Prisma.MessageGetPayload<{ select: typeof createdMessageSelect }>;

export type MessageListRecord = Prisma.MessageGetPayload<{ select: typeof messageListSelect }>;

export type MessageStatusRecord = Prisma.MessageGetPayload<{ select: typeof messageStatusSelect }>;

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

export function findMessages(statuses: MessageStatus[]): Promise<MessageListRecord[]> {
	return prisma.message.findMany({
		orderBy: { createdAt: "desc" },
		select: messageListSelect,
		where: { status: { in: statuses } },
	});
}

export function findMessageStatus(id: string): Promise<MessageStatusRecord | null> {
	return prisma.message.findUnique({
		select: messageStatusSelect,
		where: { id },
	});
}

export function updateMessageStatus(id: string, status: MessageStatus): Promise<{ id: string }> {
	return prisma.message.update({
		data: { status },
		select: createdMessageSelect,
		where: { id },
	});
}
