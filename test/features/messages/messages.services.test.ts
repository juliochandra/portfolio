import { beforeEach, describe, expect, it, vi } from "vitest";
import { MessageStatus } from "@/lib/message-status";
import { ValidationException } from "@/lib/server-action-exception/exceptions";

const mocks = vi.hoisted(() => ({
	createMessage: vi.fn(),
}));

vi.mock("@/features/messages/messages.repository", () => ({
	createMessage: mocks.createMessage,
}));

import { createPublicMessage } from "@/features/messages/messages.services";

describe("message public service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.createMessage.mockResolvedValue({ id: "message-1" });
	});

	it("validates and creates every public message with unread status", async () => {
		const input = {
			email: "  recruiter@example.com  ",
			message: "  Mari berdiskusi.  ",
			name: "  Recruiter  ",
		};

		await expect(createPublicMessage(input)).resolves.toEqual({ id: "message-1" });
		expect(mocks.createMessage).toHaveBeenCalledWith({
			email: "recruiter@example.com",
			message: "Mari berdiskusi.",
			name: "Recruiter",
			status: MessageStatus.UNREAD,
		});

		await expect(createPublicMessage({ email: "", message: "", name: "" })).rejects.toBeInstanceOf(ValidationException);
	});
});
