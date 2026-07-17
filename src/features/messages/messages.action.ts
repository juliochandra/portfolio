"use server";

import { type SendMessageInput, sendMessageSchema } from "@/features/messages/messages.schema";
import { createPublicMessage, type SentMessage } from "@/features/messages/messages.services";
import { validateWithZod } from "@/shared/validation/zod";

type SendMessageResult = { data: SentMessage } | { error: { fields: Record<string, string> } };

export async function sendMessage(data: SendMessageInput): Promise<SendMessageResult> {
	const validation = validateWithZod(sendMessageSchema, data);
	if (!validation.success) {
		return { error: { fields: validation.fields } };
	}

	return { data: await createPublicMessage(validation.data) };
}
