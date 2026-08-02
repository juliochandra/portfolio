import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	findMany: vi.fn(),
}));

vi.mock("@/lib/database/prisma", () => ({
	prisma: {
		contactInfo: {
			findMany: mocks.findMany,
		},
	},
}));

import { findContactInfo } from "@/features/contact/contact.repository";

describe("contact repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
	});

	it("queries every contact information row", async () => {
		await findContactInfo();

		expect(mocks.findMany).toHaveBeenCalledWith();
	});
});
