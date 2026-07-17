import {
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
	const statuses = tab === "arsip" ? [MessageStatus.ARCHIVED] : [MessageStatus.UNREAD, MessageStatus.READ];
	const messages = await findMessages(statuses);
	return messages.map(toAdminMessage);
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
