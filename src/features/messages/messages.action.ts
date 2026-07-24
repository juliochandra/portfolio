"use server";

import { z } from "zod";
import { adminMessagesPageSchema, type SendMessageInput, sendMessageSchema } from "@/features/messages/messages.schema";
import {
	archiveAdminMessage,
	createPublicMessage,
	getAdminMessages,
	getAdminMessagesPage,
	type MessageTab,
	markAdminMessageRead,
	type SentMessage,
	unarchiveAdminMessage,
} from "@/features/messages/messages.services";
import { getServerSession } from "@/shared/auth/server-session";
import { validateWithZod } from "@/shared/validation/zod";

type SendMessageResult = { data: SentMessage } | { error: { fields: Record<string, string> } };

const messageIdSchema = z.string().trim().min(1);
const getMessagesParamsSchema = z
	.object({
		tab: z.enum(["aktif", "arsip"]).optional(),
	})
	.optional();
const INVALID_MESSAGE_PARAMS_MESSAGE = "Parameter pesan tidak valid.";
const MESSAGE_NOT_FOUND_MESSAGE = "Pesan tidak ditemukan.";
const UNAUTHORIZED = { error: { message: "UNAUTHORIZED" } } as const;

type GetMessagesResult = { data: Awaited<ReturnType<typeof getAdminMessages>> } | { error: { message: "UNAUTHORIZED" } };

type GetMessagesPageResult =
	| { data: Awaited<ReturnType<typeof getAdminMessagesPage>> }
	| { error: { message: "UNAUTHORIZED" } };

type MessageStatusMutationResult = { data: { id: string } } | { error: { message: "Pesan tidak ditemukan." | "UNAUTHORIZED" } };

export async function sendMessage(data: SendMessageInput): Promise<SendMessageResult> {
	const validation = validateWithZod(sendMessageSchema, data);
	if (!validation.success) {
		return { error: { fields: validation.fields } };
	}

	return { data: await createPublicMessage(validation.data) };
}

export async function getMessages(params?: { tab?: MessageTab }): Promise<GetMessagesResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	const validation = validateWithZod(getMessagesParamsSchema, params);
	if (!validation.success) {
		throw new Error(INVALID_MESSAGE_PARAMS_MESSAGE);
	}

	return { data: await getAdminMessages(validation.data?.tab ?? "aktif") };
}

export async function getMessagesPage(params: { page: number; tab: MessageTab }): Promise<GetMessagesPageResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}

	const validation = validateWithZod(adminMessagesPageSchema, params);
	const input = validation.success ? validation.data : { page: 1, tab: "aktif" as const };
	return { data: await getAdminMessagesPage(input.tab, input.page) };
}

async function updateMessage(
	id: string,
	update: (messageId: string) => Promise<{ id: string } | null>,
): Promise<MessageStatusMutationResult> {
	if (!(await getServerSession())) {
		return UNAUTHORIZED;
	}
	if (!validateWithZod(messageIdSchema, id).success) {
		return { error: { message: MESSAGE_NOT_FOUND_MESSAGE } };
	}

	const message = await update(id);
	return message ? { data: message } : { error: { message: MESSAGE_NOT_FOUND_MESSAGE } };
}

export async function markMessageRead(id: string): Promise<MessageStatusMutationResult> {
	return await updateMessage(id, markAdminMessageRead);
}

export async function archiveMessage(id: string): Promise<MessageStatusMutationResult> {
	return await updateMessage(id, archiveAdminMessage);
}

export async function unarchiveMessage(id: string): Promise<MessageStatusMutationResult> {
	return await updateMessage(id, unarchiveAdminMessage);
}
