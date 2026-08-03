import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationException } from "@/lib/server-action-exception/exceptions";

const mocks = vi.hoisted(() => ({
	createPublicMessage: vi.fn(),
}));

vi.mock("@/features/messages/messages.services", () => ({
	createPublicMessage: mocks.createPublicMessage,
}));

import { sendMessage } from "@/features/messages/messages.action";

describe("message public Server Action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.createPublicMessage.mockResolvedValue({ id: "message-1" });
	});

	it("forwards a public message to the service", async () => {
		const input = {
			email: "recruiter@example.com",
			message: "Mari berdiskusi tentang peluang kerja.",
			name: "Recruiter",
		};

		await expect(sendMessage(input)).resolves.toEqual({ data: { id: "message-1" } });
		expect(mocks.createPublicMessage).toHaveBeenCalledWith(input);
	});

	it("maps validation errors from the service", async () => {
		mocks.createPublicMessage.mockRejectedValue(
			new ValidationException({ email: "Wajib diisi.", message: "Wajib diisi.", name: "Wajib diisi." }),
		);

		await expect(sendMessage({ email: "", message: "", name: "" })).resolves.toEqual({
			error: {
				code: "VALIDATION_ERROR",
				fields: {
					email: "Wajib diisi.",
					message: "Wajib diisi.",
					name: "Wajib diisi.",
				},
				message: "Input tidak valid.",
			},
		});
	});
});
