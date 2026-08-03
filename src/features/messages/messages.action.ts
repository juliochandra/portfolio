"use server";

import {
	archiveAdminMessage,
	createPublicMessage,
	getAdminMessages,
	getAdminMessagesPage,
	markAdminMessageRead,
	unarchiveAdminMessage,
} from "@/features/messages/messages.services";
import type {
	AdminMessagesPageInput,
	AdminMessagesPageResponse,
	AdminMessagesResponse,
	MessageMutationResponse,
	MessageTab,
	SendMessageInput,
	SendMessageResponse,
} from "@/features/messages/messages.type";
import { requireServerSession } from "@/lib/auth/server-session";
import { toServerActionFailure } from "@/lib/server-action-exception/to-server-action-failure";
import type { ServerActionFailure } from "@/lib/server-action-exception/types";

export async function sendMessage(input: SendMessageInput): Promise<SendMessageResponse | ServerActionFailure> {
	try {
		return { data: await createPublicMessage(input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getMessages(tab: MessageTab = "aktif"): Promise<AdminMessagesResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getAdminMessages(tab) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getMessagesPage(input: AdminMessagesPageInput): Promise<AdminMessagesPageResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getAdminMessagesPage(input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function markMessageRead(id: string): Promise<MessageMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await markAdminMessageRead(id) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function archiveMessage(id: string): Promise<MessageMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await archiveAdminMessage(id) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function unarchiveMessage(id: string): Promise<MessageMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await unarchiveAdminMessage(id) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}
