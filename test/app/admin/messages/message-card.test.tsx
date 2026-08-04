import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/messages/messages.action", () => ({
	archiveMessage: vi.fn(),
	unarchiveMessage: vi.fn(),
}));

import { MessageCard } from "@/components/admin/messages/MessageCard";

describe("MessageCard", () => {
	it("shows the restore action for archived messages", () => {
		const card = render(
			<MessageCard
				message={{
					createdAt: "2026-07-23T09:00:00.000Z",
					email: "sender@example.com",
					id: "message-1",
					message: "Halo",
					name: "Sender",
					status: "ARCHIVED",
				}}
			/>,
		);

		expect(card.getByRole("button", { name: "Kembalikan" })).toBeInTheDocument();
	});

	it("shows a new message marker for unread messages", () => {
		const card = render(
			<MessageCard
				message={{
					createdAt: "2026-07-23T09:00:00.000Z",
					email: "sender@example.com",
					id: "message-1",
					message: "Halo",
					name: "Sender",
					status: "UNREAD",
				}}
			/>,
		);

		expect(card.getByText("Pesan baru")).toBeInTheDocument();
		expect(card.getByRole("button", { name: "Arsipkan" })).toBeInTheDocument();
	});
});
