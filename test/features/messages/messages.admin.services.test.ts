import { beforeEach, describe, expect, it, vi } from "vitest";
import { MessageStatus } from "@/lib/message-status";
import { NotFoundException } from "@/lib/server-action-exception/exceptions";

const mocks = vi.hoisted(() => ({
	findMessages: vi.fn(),
	countMessages: vi.fn(),
	findMessageStatus: vi.fn(),
	updateMessageStatus: vi.fn(),
}));

vi.mock("@/features/messages/messages.repository", () => ({
	createMessage: vi.fn(),
	countMessages: mocks.countMessages,
	findMessages: mocks.findMessages,
	findMessageStatus: mocks.findMessageStatus,
	updateMessageStatus: mocks.updateMessageStatus,
}));

import {
	archiveAdminMessage,
	getAdminMessages,
	getAdminMessagesPage,
	markAdminMessageRead,
	unarchiveAdminMessage,
} from "@/features/messages/messages.services";

describe("message admin services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.updateMessageStatus.mockResolvedValue({ id: "message-1" });
		mocks.countMessages.mockResolvedValue(11);
	});

	it("returns one paginated message page", async () => {
		mocks.findMessages.mockResolvedValue([]);

		await expect(getAdminMessagesPage({ page: 2, tab: "aktif" })).resolves.toEqual({
			currentPage: 2,
			messages: [],
			totalPages: 2,
		});
		expect(mocks.countMessages).toHaveBeenCalledWith([MessageStatus.UNREAD, MessageStatus.READ]);
		expect(mocks.findMessages).toHaveBeenCalledWith([MessageStatus.UNREAD, MessageStatus.READ], { skip: 10, take: 10 });
	});

	it("filters active and archived message tabs and serializes creation dates", async () => {
		mocks.findMessages.mockResolvedValue([
			{
				createdAt: new Date("2026-07-18T10:00:00.000Z"),
				email: "sender@example.com",
				id: "message-1",
				message: "Halo",
				name: "Sender",
				status: MessageStatus.UNREAD,
			},
		]);

		await expect(getAdminMessages("aktif")).resolves.toEqual([
			{
				createdAt: "2026-07-18T10:00:00.000Z",
				email: "sender@example.com",
				id: "message-1",
				message: "Halo",
				name: "Sender",
				status: MessageStatus.UNREAD,
			},
		]);
		expect(mocks.findMessages).toHaveBeenLastCalledWith([MessageStatus.UNREAD, MessageStatus.READ]);

		await getAdminMessages("arsip");
		expect(mocks.findMessages).toHaveBeenLastCalledWith([MessageStatus.ARCHIVED]);
	});

	it("marks only unread messages as read", async () => {
		mocks.findMessageStatus.mockResolvedValue({ id: "message-1", status: MessageStatus.UNREAD });
		await expect(markAdminMessageRead("message-1")).resolves.toEqual({ id: "message-1" });
		expect(mocks.updateMessageStatus).toHaveBeenCalledWith("message-1", MessageStatus.READ);

		mocks.findMessageStatus.mockResolvedValue({ id: "message-1", status: MessageStatus.ARCHIVED });
		await expect(markAdminMessageRead("message-1")).resolves.toEqual({ id: "message-1" });
		expect(mocks.updateMessageStatus).toHaveBeenCalledTimes(1);
	});

	it("archives active messages and restores archived messages to read", async () => {
		mocks.findMessageStatus.mockResolvedValue({ id: "message-1", status: MessageStatus.READ });
		await archiveAdminMessage("message-1");
		expect(mocks.updateMessageStatus).toHaveBeenCalledWith("message-1", MessageStatus.ARCHIVED);

		mocks.findMessageStatus.mockResolvedValue({ id: "message-1", status: MessageStatus.ARCHIVED });
		await unarchiveAdminMessage("message-1");
		expect(mocks.updateMessageStatus).toHaveBeenLastCalledWith("message-1", MessageStatus.READ);
	});

	it("does not mutate a missing message", async () => {
		mocks.findMessageStatus.mockResolvedValue(null);

		await expect(markAdminMessageRead("missing")).rejects.toBeInstanceOf(NotFoundException);
		await expect(archiveAdminMessage("missing")).rejects.toBeInstanceOf(NotFoundException);
		await expect(unarchiveAdminMessage("missing")).rejects.toBeInstanceOf(NotFoundException);
		expect(mocks.updateMessageStatus).not.toHaveBeenCalled();
	});
});
