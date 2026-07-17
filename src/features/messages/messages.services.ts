import { createMessage } from "@/features/messages/messages.repository";
import type { SendMessageInput } from "@/features/messages/messages.schema";
import { MessageStatus } from "@/generated/prisma/client";

export type SentMessage = { id: string };

export function createPublicMessage(input: SendMessageInput): Promise<SentMessage> {
	return createMessage({
		...input,
		status: MessageStatus.UNREAD,
	});
}
