import {
	countMessages,
	createMessage,
	findMessageStatus,
	findMessages,
	type MessageListRecord,
	updateMessageStatus,
} from "@/features/messages/messages.repository";
import { adminMessagesPageSchema, sendMessageSchema } from "@/features/messages/messages.schema";
import type {
	AdminMessage,
	AdminMessagesPage,
	AdminMessagesPageInput,
	MessageTab,
	SendMessageInput,
	SentMessage,
} from "@/features/messages/messages.type";
import { MessageStatus, toMessageStatus } from "@/lib/message-status";
import { NotFoundException, ValidationException } from "@/lib/server-action-exception/exceptions";
import { validateWithZod } from "@/lib/validation/zod";

export const ADMIN_MESSAGES_PER_PAGE = 10;

export async function createPublicMessage(input: SendMessageInput): Promise<SentMessage> {
	const validation = validateWithZod(sendMessageSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const message = await createMessage({
		...validation.data,
		status: MessageStatus.UNREAD,
	});
	return message;
}

function toAdminMessage(message: MessageListRecord): AdminMessage {
	return {
		...message,
		createdAt: message.createdAt.toISOString(),
		status: toMessageStatus(message.status),
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

export async function getAdminMessagesPage(input: AdminMessagesPageInput): Promise<AdminMessagesPage> {
	const validation = validateWithZod(adminMessagesPageSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const statuses = getMessageStatuses(validation.data.tab);
	const totalMessages = await countMessages(statuses);
	const totalPages = Math.max(1, Math.ceil(totalMessages / ADMIN_MESSAGES_PER_PAGE));
	const currentPage = Math.min(validation.data.page, totalPages);
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

export async function markAdminMessageRead(id: string): Promise<{ id: string }> {
	const message = await findMessageStatus(id);
	if (!message) {
		throw new NotFoundException("Pesan tidak ditemukan.");
	}
	return message.status === MessageStatus.UNREAD ? updateMessageStatus(id, MessageStatus.READ) : { id: message.id };
}

export async function archiveAdminMessage(id: string): Promise<{ id: string }> {
	const message = await findMessageStatus(id);
	if (!message) {
		throw new NotFoundException("Pesan tidak ditemukan.");
	}
	return message.status === MessageStatus.ARCHIVED ? { id: message.id } : updateMessageStatus(id, MessageStatus.ARCHIVED);
}

export async function unarchiveAdminMessage(id: string): Promise<{ id: string }> {
	const message = await findMessageStatus(id);
	if (!message) {
		throw new NotFoundException("Pesan tidak ditemukan.");
	}
	return message.status === MessageStatus.ARCHIVED ? updateMessageStatus(id, MessageStatus.READ) : { id: message.id };
}
