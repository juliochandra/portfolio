import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createContactInfoRecord: vi.fn(),
	deleteContactInfoRecord: vi.fn(),
	findContactInfoAdmin: vi.fn(),
	findContactInfoForAdmin: vi.fn(),
	updateContactInfoRecord: vi.fn(),
}));

vi.mock("@/features/contact/contact.repository", () => ({
	createContactInfoRecord: mocks.createContactInfoRecord,
	deleteContactInfoRecord: mocks.deleteContactInfoRecord,
	findContactInfo: vi.fn(),
	findContactInfoAdmin: mocks.findContactInfoAdmin,
	findContactInfoForAdmin: mocks.findContactInfoForAdmin,
	updateContactInfoRecord: mocks.updateContactInfoRecord,
}));

import {
	createAdminContactInfo,
	deleteAdminContactInfo,
	getContactInfoAdmin,
	updateAdminContactInfo,
} from "@/features/contact/contact.services";

const input = {
	icon: null,
	label: "Email",
	value: "hello@example.com",
};

describe("contact info admin services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.createContactInfoRecord.mockResolvedValue({ id: "contact-1" });
		mocks.updateContactInfoRecord.mockResolvedValue({ id: "contact-1" });
		mocks.deleteContactInfoRecord.mockResolvedValue({ id: "contact-1" });
	});

	it("returns the admin contact information list", async () => {
		mocks.findContactInfoAdmin.mockResolvedValue([{ ...input, id: "contact-1" }]);

		await expect(getContactInfoAdmin()).resolves.toEqual([{ ...input, id: "contact-1" }]);
	});

	it("creates a single contact information row", async () => {
		await expect(createAdminContactInfo(input)).resolves.toEqual({ id: "contact-1" });
		expect(mocks.createContactInfoRecord).toHaveBeenCalledWith(input);
	});

	it("updates and deletes only an existing contact information row", async () => {
		mocks.findContactInfoForAdmin.mockResolvedValue({ id: "contact-1" });

		await expect(updateAdminContactInfo("contact-1", input)).resolves.toEqual({ id: "contact-1" });
		expect(mocks.updateContactInfoRecord).toHaveBeenCalledWith("contact-1", input);
		await expect(deleteAdminContactInfo("contact-1")).resolves.toEqual({ id: "contact-1" });
		expect(mocks.deleteContactInfoRecord).toHaveBeenCalledWith("contact-1");
	});

	it("does not mutate a missing contact information row", async () => {
		mocks.findContactInfoForAdmin.mockResolvedValue(null);

		await expect(updateAdminContactInfo("missing", input)).resolves.toBeNull();
		await expect(deleteAdminContactInfo("missing")).resolves.toBeNull();
		expect(mocks.updateContactInfoRecord).not.toHaveBeenCalled();
		expect(mocks.deleteContactInfoRecord).not.toHaveBeenCalled();
	});
});
