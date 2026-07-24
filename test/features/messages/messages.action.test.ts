import { beforeEach, describe, expect, it, vi } from "vitest";

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

	it("normalizes, stores, and returns a valid message id", async () => {
		const result = await sendMessage({
			email: "  recruiter@example.com  ",
			message: "  Mari berdiskusi tentang peluang kerja.  ",
			name: "  Recruiter  ",
		});

		expect(result).toEqual({ data: { id: "message-1" } });
		expect(mocks.createPublicMessage).toHaveBeenCalledWith({
			email: "recruiter@example.com",
			message: "Mari berdiskusi tentang peluang kerja.",
			name: "Recruiter",
		});
	});

	it("returns field errors and does not store empty required values", async () => {
		const result = await sendMessage({ email: "", message: "   ", name: "" });

		expect(result).toEqual({
			error: {
				fields: {
					email: "Wajib diisi.",
					message: "Wajib diisi.",
					name: "Wajib diisi.",
				},
			},
		});
		expect(mocks.createPublicMessage).not.toHaveBeenCalled();
	});

	it("returns field errors for invalid email and bounded fields", async () => {
		const result = await sendMessage({
			email: "invalid-email",
			message: "Pesan",
			name: "a".repeat(101),
		});

		expect(result).toEqual({
			error: {
				fields: {
					email: "Format email tidak valid.",
					name: "Maksimal 100 karakter.",
				},
			},
		});
		expect(mocks.createPublicMessage).not.toHaveBeenCalled();
	});
});
