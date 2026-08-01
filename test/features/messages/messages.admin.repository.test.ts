import { beforeEach, describe, expect, it, vi } from "vitest";
import { MessageStatus } from "@/lib/message-status";

const mocks = vi.hoisted(() => ({
	count: vi.fn(),
	findMany: vi.fn(),
	update: vi.fn(),
}));

vi.mock("@/lib/database/prisma", () => ({
	prisma: {
		message: {
			create: vi.fn(),
			count: mocks.count,
			findMany: mocks.findMany,
			findUnique: vi.fn(),
			update: mocks.update,
		},
	},
}));

import { countMessages, findMessages, updateMessageStatus } from "@/features/messages/messages.repository";

describe("message admin repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
		mocks.count.mockResolvedValue(0);
		mocks.update.mockResolvedValue({ id: "message-1" });
	});

	it("counts messages with the selected statuses", async () => {
		await expect(countMessages([MessageStatus.ARCHIVED])).resolves.toBe(0);
		expect(mocks.count).toHaveBeenCalledWith({ where: { status: { in: [MessageStatus.ARCHIVED] } } });
	});

	it("lists selected statuses ordered by newest creation", async () => {
		await findMessages([MessageStatus.UNREAD, MessageStatus.READ]);

		expect(mocks.findMany).toHaveBeenCalledWith({
			orderBy: { createdAt: "desc" },
			select: {
				createdAt: true,
				email: true,
				id: true,
				message: true,
				name: true,
				status: true,
			},
			where: { status: { in: [MessageStatus.UNREAD, MessageStatus.READ] } },
		});
	});

	it("updates only the message status", async () => {
		await expect(updateMessageStatus("message-1", MessageStatus.ARCHIVED)).resolves.toEqual({ id: "message-1" });

		expect(mocks.update).toHaveBeenCalledWith({
			data: { status: MessageStatus.ARCHIVED },
			select: { id: true },
			where: { id: "message-1" },
		});
	});
});
