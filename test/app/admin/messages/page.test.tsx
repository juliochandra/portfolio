import { cleanup, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	archiveMessage: vi.fn(),
	getMessages: vi.fn(),
	markMessageRead: vi.fn(),
	unarchiveMessage: vi.fn(),
}));

vi.mock("@/features/messages/messages.action", () => ({
	archiveMessage: mocks.archiveMessage,
	getMessages: mocks.getMessages,
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
		mocks.getMessages.mockResolvedValue({
			data: [
				{
					createdAt: "2026-07-23T09:00:00.000Z",
					email: "sender@example.com",
					id: "message-1",
					message: "Halo dari formulir kontak.",
					name: "Sender",
					status: "UNREAD",
				},
			],
		});

		const page = render(await MessagesPage({ searchParams: Promise.resolve({}) }));

		expect(mocks.getMessages).toHaveBeenCalledWith({ tab: "aktif" });
		expect(mocks.markMessageRead).toHaveBeenCalledWith("message-1");
		expect(page.getByText("Sender")).toBeInTheDocument();
		expect(page.getByRole("link", { name: "sender@example.com" })).toHaveAttribute("href", "mailto:sender@example.com");
		expect(page.getByRole("button", { name: "Arsipkan" })).toBeInTheDocument();
		expect(page.queryByText("Belum dibaca")).not.toBeInTheDocument();
		expect(page.getByRole("link", { name: "Archived" })).toHaveAttribute("href", "/admin/messages?tab=arsip");
	});

	it("shows the archived empty state and does not mark messages", async () => {
		mocks.getMessages.mockResolvedValue({ data: [] });

		const page = render(await MessagesPage({ searchParams: Promise.resolve({ tab: "arsip" }) }));

		expect(mocks.getMessages).toHaveBeenCalledWith({ tab: "arsip" });
		expect(mocks.markMessageRead).not.toHaveBeenCalled();
		expect(page.getByText("Belum ada pesan diarsipkan.")).toBeInTheDocument();
	});
});
