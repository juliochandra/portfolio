import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	findContactInfo: vi.fn(),
}));

vi.mock("@/features/contact/contact.repository", () => ({
	findContactInfo: mocks.findContactInfo,
}));

import { getPublicContactInfo } from "@/features/contact/contact.services";

describe("contact public service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("maps every contact information record", async () => {
		const records = [
			{
				icon: null,
				id: "contact-1",
				label: "Email",
				value: "hello@example.com",
			},
		];
		mocks.findContactInfo.mockResolvedValue(records);

		await expect(getPublicContactInfo()).resolves.toEqual(records);
		expect(mocks.findContactInfo).toHaveBeenCalledOnce();
	});
});
