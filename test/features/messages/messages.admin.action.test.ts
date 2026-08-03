import { beforeEach, describe, expect, it, vi } from "vitest";
import { MessageStatus } from "@/lib/message-status";
import { NotFoundException, UnauthorizedException } from "@/lib/server-action-exception/exceptions";

const mocks = vi.hoisted(() => ({
	archiveAdminMessage: vi.fn(),
	getAdminMessages: vi.fn(),
	getAdminMessagesPage: vi.fn(),
	markAdminMessageRead: vi.fn(),
	requireServerSession: vi.fn(),
	unarchiveAdminMessage: vi.fn(),
}));

vi.mock("@/lib/auth/server-session", () => ({
	requireServerSession: mocks.requireServerSession,
}));
vi.mock("@/features/messages/messages.services", () => ({
	archiveAdminMessage: mocks.archiveAdminMessage,
	createPublicMessage: vi.fn(),
	getAdminMessages: mocks.getAdminMessages,
	getAdminMessagesPage: mocks.getAdminMessagesPage,
	markAdminMessageRead: mocks.markAdminMessageRead,
	unarchiveAdminMessage: mocks.unarchiveAdminMessage,
}));

import {
	archiveMessage,
	getMessages,
	getMessagesPage,
	markMessageRead,
	unarchiveMessage,
} from "@/features/messages/messages.action";

describe("message admin Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.requireServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getAdminMessages.mockResolvedValue([]);
		mocks.getAdminMessagesPage.mockResolvedValue({ currentPage: 1, messages: [], totalPages: 1 });
		mocks.markAdminMessageRead.mockResolvedValue({ id: "message-1" });
		mocks.archiveAdminMessage.mockResolvedValue({ id: "message-1" });
		mocks.unarchiveAdminMessage.mockResolvedValue({ id: "message-1" });
	});

	it("checks a session before every admin action", async () => {
		mocks.requireServerSession.mockRejectedValue(new UnauthorizedException("UNAUTHORIZED"));
		const unauthorized = { error: { code: "UNAUTHORIZED", message: "UNAUTHORIZED" } };

		await expect(getMessages()).resolves.toEqual(unauthorized);
		await expect(getMessagesPage({ page: 1, tab: "aktif" })).resolves.toEqual(unauthorized);
		await expect(markMessageRead("message-1")).resolves.toEqual(unauthorized);
		await expect(archiveMessage("message-1")).resolves.toEqual(unauthorized);
		await expect(unarchiveMessage("message-1")).resolves.toEqual(unauthorized);
	});

	it("returns paginated and tab-filtered messages", async () => {
		mocks.getAdminMessagesPage.mockResolvedValue({ currentPage: 2, messages: [], totalPages: 3 });
		mocks.getAdminMessages.mockResolvedValue([
			{
				createdAt: "2026-07-18T10:00:00.000Z",
				email: "sender@example.com",
				id: "message-1",
				message: "Halo",
				name: "Sender",
				status: MessageStatus.UNREAD,
			},
		]);

		await expect(getMessagesPage({ page: 2, tab: "arsip" })).resolves.toEqual({
			data: { currentPage: 2, messages: [], totalPages: 3 },
		});
		expect(mocks.getAdminMessagesPage).toHaveBeenCalledWith({ page: 2, tab: "arsip" });

		await expect(getMessages("aktif")).resolves.toEqual({ data: expect.any(Array) });
		expect(mocks.getAdminMessages).toHaveBeenCalledWith("aktif");
	});

	it("marks, archives, and unarchives a message", async () => {
		await expect(markMessageRead("message-1")).resolves.toEqual({ data: { id: "message-1" } });
		await expect(archiveMessage("message-1")).resolves.toEqual({ data: { id: "message-1" } });
		await expect(unarchiveMessage("message-1")).resolves.toEqual({ data: { id: "message-1" } });
	});

	it("maps missing messages from the service", async () => {
		mocks.markAdminMessageRead.mockRejectedValue(new NotFoundException("Pesan tidak ditemukan."));

		await expect(markMessageRead("missing")).resolves.toEqual({
			error: { code: "NOT_FOUND", message: "Pesan tidak ditemukan." },
		});
	});
});
