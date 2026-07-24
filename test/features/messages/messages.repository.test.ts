import { beforeEach, describe, expect, it, vi } from "vitest";
import { MessageStatus } from "@/shared/message-status";

const mocks = vi.hoisted(() => ({
	create: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
	prisma: {
		message: {
			create: mocks.create,
		},
	},
}));

import { createMessage } from "@/features/messages/messages.repository";

describe("message repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.create.mockResolvedValue({ id: "message-1" });
	});

	it("inserts a message and returns only its id", async () => {
		const input = {
			email: "recruiter@example.com",
			message: "Mari berdiskusi.",
			name: "Recruiter",
			status: MessageStatus.UNREAD,
		};

		await expect(createMessage(input)).resolves.toEqual({ id: "message-1" });
		expect(mocks.create).toHaveBeenCalledWith({
			data: input,
			select: { id: true },
		});
	});
});
