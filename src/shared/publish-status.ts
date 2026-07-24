export const publishStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export const PublishStatus = {
	ARCHIVED: "ARCHIVED",
	DRAFT: "DRAFT",
	PUBLISHED: "PUBLISHED",
} as const;

export type PublishStatus = (typeof publishStatuses)[number];

export function toPublishStatus(value: string): PublishStatus {
	if (publishStatuses.includes(value as PublishStatus)) {
		return value as PublishStatus;
	}

	throw new Error("Status publikasi tidak valid.");
}

export const publishStatusLabels: Record<PublishStatus, string> = {
	ARCHIVED: "Archived",
	DRAFT: "Draft",
	PUBLISHED: "Published",
};
