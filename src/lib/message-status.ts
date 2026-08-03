export const MessageStatus = {
	ARCHIVED: "ARCHIVED",
	READ: "READ",
	UNREAD: "UNREAD",
} as const;

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export function toMessageStatus(value: string): MessageStatus {
	const statuses = Object.values(MessageStatus);
	if (statuses.includes(value as MessageStatus)) {
		return value as MessageStatus;
	}

	throw new Error("Status pesan tidak valid.");
}
