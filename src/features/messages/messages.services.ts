import {
	countMessages,
	createMessage,
	findMessageStatus,
	findMessages,
	type MessageListRecord,
	updateMessageStatus,
} from "@/features/messages/messages.repository";
import type { SendMessageInput } from "@/features/messages/messages.schema";
import { MessageStatus } from "@/generated/prisma/client";

export type SentMessage = { id: string };

export type MessageTab = "aktif" | "arsip";

export type AdminMessage = {
	createdAt: string;
	email: string;
	id: string;
	message: string;
	name: string;
	status: MessageStatus;
};

export const ADMIN_MESSAGES_PER_PAGE = 10;

export type AdminMessagesPage = {
	currentPage: number;
	messages: AdminMessage[];
	totalPages: number;
};

export function createPublicMessage(input: SendMessageInput): Promise<SentMessage> {
	return createMessage({
		...input,
		status: MessageStatus.UNREAD,
	});
}

function toAdminMessage(message: MessageListRecord): AdminMessage {
	return {
		...message,
		createdAt: message.createdAt.toISOString(),
	};
}

export async function getAdminMessages(tab: MessageTab): Promise<AdminMessage[]> {
	const statuses = getMessageStatuses(tab);
	const messages = await findMessages(statuses);
	return messages.map(toAdminMessage);
}

function getMessageStatuses(tab: MessageTab): MessageStatus[] {
	return tab === "arsip" ? [MessageStatus.ARCHIVED] : [MessageStatus.UNREAD, MessageStatus.READ];
}

export async function getAdminMessagesPage(tab: MessageTab, page: number): Promise<AdminMessagesPage> {
	const statuses = getMessageStatuses(tab);
	const totalMessages = await countMessages(statuses);
	const totalPages = Math.max(1, Math.ceil(totalMessages / ADMIN_MESSAGES_PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const messages = await findMessages(statuses, {
		skip: (currentPage - 1) * ADMIN_MESSAGES_PER_PAGE,
		take: ADMIN_MESSAGES_PER_PAGE,
	});

	return {
		currentPage,
		messages: messages.map(toAdminMessage),
		totalPages,
	};
}

export async function markAdminMessageRead(id: string): Promise<{ id: string } | null> {
	const message = await findMessageStatus(id);
	if (!message) {
		return null;
	}
	return message.status === MessageStatus.UNREAD ? updateMessageStatus(id, MessageStatus.READ) : { id: message.id };
}

export async function archiveAdminMessage(id: string): Promise<{ id: string } | null> {
	const message = await findMessageStatus(id);
	if (!message) {
		return null;
	}
	return message.status === MessageStatus.ARCHIVED ? { id: message.id } : updateMessageStatus(id, MessageStatus.ARCHIVED);
}

export async function unarchiveAdminMessage(id: string): Promise<{ id: string } | null> {
	const message = await findMessageStatus(id);
	if (!message) {
		return null;
	}
	return message.status === MessageStatus.ARCHIVED ? updateMessageStatus(id, MessageStatus.READ) : { id: message.id };
}
