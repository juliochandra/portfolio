import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException, ValidationException } from "@/lib/server-action-exception/exceptions";

const mocks = vi.hoisted(() => ({
	createContactInfoRecord: vi.fn(),
	deleteContactInfoRecord: vi.fn(),
	findContactInfo: vi.fn(),
	findContactInfoForAdmin: vi.fn(),
	updateContactInfoRecord: vi.fn(),
}));

vi.mock("@/features/contact/contact.repository", () => ({
	createContactInfoRecord: mocks.createContactInfoRecord,
	deleteContactInfoRecord: mocks.deleteContactInfoRecord,
	findContactInfo: mocks.findContactInfo,
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
	value: "mailto:hello@example.com",
};

const contactInfo = { ...input, id: "contact-1" };

describe("contact info admin services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.createContactInfoRecord.mockResolvedValue(contactInfo);
		mocks.updateContactInfoRecord.mockResolvedValue(contactInfo);
		mocks.deleteContactInfoRecord.mockResolvedValue(contactInfo);
	});

	it("returns the admin contact information list", async () => {
		mocks.findContactInfo.mockResolvedValue([contactInfo]);

		await expect(getContactInfoAdmin()).resolves.toEqual([contactInfo]);
	});

	it("creates a single contact information row", async () => {
		await expect(createAdminContactInfo(input)).resolves.toEqual(contactInfo);
		expect(mocks.createContactInfoRecord).toHaveBeenCalledWith(input);
	});

	it("validates and transforms contact information before saving it", async () => {
		await expect(
			createAdminContactInfo({ icon: null, label: "github profile", value: "mailto:github@example.com" }),
		).resolves.toEqual(contactInfo);
		expect(mocks.createContactInfoRecord).toHaveBeenCalledWith({
			icon: null,
			label: "Github Profile",
			value: "mailto:github@example.com",
		});

		await expect(createAdminContactInfo({ icon: null, label: "", value: "invalid-url" })).rejects.toBeInstanceOf(
			ValidationException,
		);
	});

	it("updates and deletes only an existing contact information row", async () => {
		mocks.findContactInfoForAdmin.mockResolvedValue({ id: "contact-1" });

		await expect(updateAdminContactInfo("contact-1", input)).resolves.toEqual(contactInfo);
		expect(mocks.updateContactInfoRecord).toHaveBeenCalledWith("contact-1", input);
		await expect(deleteAdminContactInfo("contact-1")).resolves.toEqual(contactInfo);
		expect(mocks.deleteContactInfoRecord).toHaveBeenCalledWith("contact-1");
	});

	it("does not mutate a missing contact information row", async () => {
		mocks.findContactInfoForAdmin.mockResolvedValue(null);

		await expect(updateAdminContactInfo("missing", input)).rejects.toBeInstanceOf(NotFoundException);
		await expect(deleteAdminContactInfo("missing")).rejects.toBeInstanceOf(NotFoundException);
		expect(mocks.updateContactInfoRecord).not.toHaveBeenCalled();
		expect(mocks.deleteContactInfoRecord).not.toHaveBeenCalled();
	});
});
