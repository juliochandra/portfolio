import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getPublicContactInfo: vi.fn(),
}));

vi.mock("@/features/contact/contact.services", () => ({
	getPublicContactInfo: mocks.getPublicContactInfo,
}));

import { getContactInfo } from "@/features/contact/contact.action";

const contactInfo = {
	icon: "SiLinkedin",
	id: "contact-1",
	label: "LinkedIn",
	value: "https://linkedin.com/in/example",
};

describe("contact public Server Action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getPublicContactInfo.mockResolvedValue([contactInfo]);
	});

	it("returns all public contact information", async () => {
		await expect(getContactInfo()).resolves.toEqual({ data: [contactInfo] });
	});

	it("returns an empty list as a successful result", async () => {
		mocks.getPublicContactInfo.mockResolvedValue([]);

		await expect(getContactInfo()).resolves.toEqual({ data: [] });
	});
});
