import { cleanup, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	archiveMessage: vi.fn(),
	getMessagesPage: vi.fn(),
	markMessageRead: vi.fn(),
	unarchiveMessage: vi.fn(),
}));

vi.mock("@/features/messages/messages.action", () => ({
	archiveMessage: mocks.archiveMessage,
	getMessagesPage: mocks.getMessagesPage,
	markMessageRead: mocks.markMessageRead,
	unarchiveMessage: mocks.unarchiveMessage,
}));

import MessagesPage from "@/app/admin/messages/page";

// biome-ignore lint/nursery/noSecrets: Component name, not a secret.
describe("MessagesPage", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.markMessageRead.mockResolvedValue({ data: { id: "message-1" } });
	});

	it("shows active messages and marks unread messages as read before rendering", async () => {
		mocks.getMessagesPage.mockResolvedValue({
			data: {
				currentPage: 1,
				messages: [
					{
						createdAt: "2026-07-23T09:00:00.000Z",
						email: "sender@example.com",
						id: "message-1",
						message: "Halo dari formulir kontak.",
						name: "Sender",
						status: "UNREAD",
					},
				],
				totalPages: 2,
			},
		});

		const page = render(await MessagesPage({ searchParams: Promise.resolve({}) }));

		expect(mocks.getMessagesPage).toHaveBeenCalledWith({ page: 1, tab: "aktif" });
		expect(mocks.markMessageRead).toHaveBeenCalledWith("message-1");
		expect(page.getByText("Sender")).toBeInTheDocument();
		expect(page.getByRole("link", { name: "sender@example.com" })).toHaveAttribute("href", "mailto:sender@example.com");
		expect(page.getByRole("button", { name: "Arsipkan" })).toBeInTheDocument();
		expect(page.getByText("Pesan baru")).toBeInTheDocument();
		expect(page.getByRole("link", { name: "Archived" })).toHaveAttribute("href", "/admin/messages?tab=arsip");
		expect(page.getByRole("navigation", { name: "Pagination pesan" })).toBeInTheDocument();
	});

	it("shows the archived empty state and does not mark messages", async () => {
		mocks.getMessagesPage.mockResolvedValue({ data: { currentPage: 1, messages: [], totalPages: 1 } });

		const page = render(await MessagesPage({ searchParams: Promise.resolve({ tab: "arsip" }) }));

		expect(mocks.getMessagesPage).toHaveBeenCalledWith({ page: 1, tab: "arsip" });
		expect(mocks.markMessageRead).not.toHaveBeenCalled();
		expect(page.getByText("Belum ada pesan diarsipkan.")).toBeInTheDocument();
	});
});
