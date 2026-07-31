import { beforeEach, describe, expect, it, vi } from "vitest";
import { MessageStatus } from "@/shared/message-status";

const mocks = vi.hoisted(() => ({
	archiveAdminMessage: vi.fn(),
	getAdminMessages: vi.fn(),
	getAdminMessagesPage: vi.fn(),
	getServerSession: vi.fn(),
	markAdminMessageRead: vi.fn(),
	unarchiveAdminMessage: vi.fn(),
}));

vi.mock("@/lib/auth/server-session", () => ({
	getServerSession: mocks.getServerSession,
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
		mocks.getServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getAdminMessages.mockResolvedValue([]);
		mocks.getAdminMessagesPage.mockResolvedValue({ currentPage: 1, messages: [], totalPages: 1 });
		mocks.markAdminMessageRead.mockResolvedValue({ id: "message-1" });
		mocks.archiveAdminMessage.mockResolvedValue({ id: "message-1" });
		mocks.unarchiveAdminMessage.mockResolvedValue({ id: "message-1" });
	});

	it("checks a session before every admin action", async () => {
		mocks.getServerSession.mockResolvedValue(null);

		await expect(getMessages()).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(getMessagesPage({ page: 1, tab: "aktif" })).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(markMessageRead("message-1")).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(archiveMessage("message-1")).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(unarchiveMessage("message-1")).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
	});

	it("returns a paginated message list", async () => {
		mocks.getAdminMessagesPage.mockResolvedValue({ currentPage: 2, messages: [], totalPages: 3 });

		await expect(getMessagesPage({ page: 2, tab: "arsip" })).resolves.toEqual({
			data: { currentPage: 2, messages: [], totalPages: 3 },
		});
		expect(mocks.getAdminMessagesPage).toHaveBeenCalledWith("arsip", 2);
	});

	it("lists active messages by default and archived messages on the archive tab", async () => {
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

		await expect(getMessages()).resolves.toEqual({ data: expect.any(Array) });
		expect(mocks.getAdminMessages).toHaveBeenLastCalledWith("aktif");

		await getMessages({ tab: "arsip" });
		expect(mocks.getAdminMessages).toHaveBeenLastCalledWith("arsip");
	});

	it("marks, archives, and unarchives a message", async () => {
		await expect(markMessageRead("message-1")).resolves.toEqual({ data: { id: "message-1" } });
		expect(mocks.markAdminMessageRead).toHaveBeenCalledWith("message-1");

		await expect(archiveMessage("message-1")).resolves.toEqual({ data: { id: "message-1" } });
		expect(mocks.archiveAdminMessage).toHaveBeenCalledWith("message-1");

		await expect(unarchiveMessage("message-1")).resolves.toEqual({ data: { id: "message-1" } });
		expect(mocks.unarchiveAdminMessage).toHaveBeenCalledWith("message-1");
	});

	it("maps missing messages to the action contract", async () => {
		mocks.markAdminMessageRead.mockResolvedValue(null);
		mocks.archiveAdminMessage.mockResolvedValue(null);
		mocks.unarchiveAdminMessage.mockResolvedValue(null);

		await expect(markMessageRead("missing")).resolves.toEqual({ error: { message: "Pesan tidak ditemukan." } });
		await expect(archiveMessage("missing")).resolves.toEqual({ error: { message: "Pesan tidak ditemukan." } });
		await expect(unarchiveMessage("missing")).resolves.toEqual({ error: { message: "Pesan tidak ditemukan." } });
	});
});
