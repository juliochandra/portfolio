import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ContactInfoWriteInput } from "@/features/contact/contact.type";
import { NotFoundException, UnauthorizedException, ValidationException } from "@/lib/server-action-exception/exceptions";

const mocks = vi.hoisted(() => ({
	createAdminContactInfo: vi.fn(),
	deleteAdminContactInfo: vi.fn(),
	getContactInfoAdmin: vi.fn(),
	requireServerSession: vi.fn(),
	updateAdminContactInfo: vi.fn(),
}));

vi.mock("@/lib/auth/server-session", () => ({
	requireServerSession: mocks.requireServerSession,
}));
vi.mock("@/features/contact/contact.services", () => ({
	createAdminContactInfo: mocks.createAdminContactInfo,
	deleteAdminContactInfo: mocks.deleteAdminContactInfo,
	getContactInfoAdmin: mocks.getContactInfoAdmin,
	getPublicContactInfo: vi.fn(),
	updateAdminContactInfo: mocks.updateAdminContactInfo,
}));

import {
	createContactInfo,
	deleteContactInfo,
	getContactInfoAdmin,
	updateContactInfo,
} from "@/features/contact/contact.action";

function contactInfoInput(values: Partial<ContactInfoWriteInput> = {}): ContactInfoWriteInput {
	return {
		icon: null,
		label: "Email",
		value: "mailto:hello@example.com",
		...values,
	};
}

describe("contact info admin Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.requireServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getContactInfoAdmin.mockResolvedValue([]);
		mocks.createAdminContactInfo.mockResolvedValue({ id: "contact-1" });
		mocks.updateAdminContactInfo.mockResolvedValue({ id: "contact-1" });
		mocks.deleteAdminContactInfo.mockResolvedValue({ id: "contact-1" });
	});

	it("checks a session before every admin action", async () => {
		mocks.requireServerSession.mockRejectedValue(new UnauthorizedException("UNAUTHORIZED"));

		const unauthorized = { error: { code: "UNAUTHORIZED", message: "UNAUTHORIZED" } };

		await expect(getContactInfoAdmin()).resolves.toEqual(unauthorized);
		await expect(createContactInfo(contactInfoInput())).resolves.toEqual(unauthorized);
		await expect(updateContactInfo("contact-1", contactInfoInput())).resolves.toEqual(unauthorized);
		await expect(deleteContactInfo("contact-1")).resolves.toEqual(unauthorized);
		expect(mocks.createAdminContactInfo).not.toHaveBeenCalled();
	});

	it("lists all contact information for an authenticated admin", async () => {
		mocks.getContactInfoAdmin.mockResolvedValue([
			{ icon: null, id: "contact-1", label: "Email", value: "hello@example.com" },
		]);

		await expect(getContactInfoAdmin()).resolves.toEqual({
			data: [{ icon: null, id: "contact-1", label: "Email", value: "hello@example.com" }],
		});
	});

	it("forwards the input to the service and creates contact information", async () => {
		const input = contactInfoInput({ label: "github profile" });

		await expect(createContactInfo(input)).resolves.toEqual({
			data: { id: "contact-1" },
		});
		expect(mocks.createAdminContactInfo).toHaveBeenCalledWith(input);
	});

	it("maps validation errors from the service", async () => {
		mocks.createAdminContactInfo.mockRejectedValue(new ValidationException({ label: "Wajib diisi.", value: "Wajib diisi." }));

		await expect(createContactInfo(contactInfoInput({ label: "", value: "" }))).resolves.toEqual({
			error: {
				code: "VALIDATION_ERROR",
				fields: { label: "Wajib diisi.", value: "Wajib diisi." },
				message: "Input tidak valid.",
			},
		});
	});

	it("updates and deletes contact information for an authenticated admin", async () => {
		await expect(updateContactInfo("contact-1", contactInfoInput({ icon: "SiMail" }))).resolves.toEqual({
			data: { id: "contact-1" },
		});
		expect(mocks.updateAdminContactInfo).toHaveBeenCalledWith("contact-1", {
			icon: "SiMail",
			label: "Email",
			value: "mailto:hello@example.com",
		});

		await expect(deleteContactInfo("contact-1")).resolves.toEqual({ data: { id: "contact-1" } });
	});

	it("maps missing contact information from the service", async () => {
		mocks.updateAdminContactInfo.mockRejectedValue(new NotFoundException("Info kontak tidak ditemukan."));
		mocks.deleteAdminContactInfo.mockRejectedValue(new NotFoundException("Info kontak tidak ditemukan."));

		await expect(updateContactInfo("missing", contactInfoInput())).resolves.toEqual({
			error: { code: "NOT_FOUND", message: "Info kontak tidak ditemukan." },
		});
		await expect(deleteContactInfo("missing")).resolves.toEqual({
			error: { code: "NOT_FOUND", message: "Info kontak tidak ditemukan." },
		});
	});
});
