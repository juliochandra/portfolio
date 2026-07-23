export const publishStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type PublishStatus = (typeof publishStatuses)[number];

export const publishStatusLabels: Record<PublishStatus, string> = {
	ARCHIVED: "Archived",
	DRAFT: "Draft",
	PUBLISHED: "Published",
};
