import type { MessageStatus } from "@/lib/message-status";

export type SendMessageInput = {
	email: string;
	message: string;
	name: string;
};

export type MessageTab = "aktif" | "arsip";

export type AdminMessagesPageInput = {
	page: number;
	tab: MessageTab;
};

export type SentMessage = {
	id: string;
};

export type AdminMessage = {
	createdAt: string;
	email: string;
	id: string;
	message: string;
	name: string;
	status: MessageStatus;
};

export type AdminMessagesPage = {
	currentPage: number;
	messages: AdminMessage[];
	totalPages: number;
};

export type SendMessageResponse = {
	data: SentMessage;
};

export type AdminMessagesResponse = {
	data: AdminMessage[];
};

export type AdminMessagesPageResponse = {
	data: AdminMessagesPage;
};

export type MessageMutationResponse = {
	data: {
		id: string;
	};
};
