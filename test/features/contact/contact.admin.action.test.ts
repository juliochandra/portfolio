import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createAdminContactInfo: vi.fn(),
	deleteAdminContactInfo: vi.fn(),
	getContactInfoAdmin: vi.fn(),
	getServerSession: vi.fn(),
	updateAdminContactInfo: vi.fn(),
}));

vi.mock("@/lib/auth/server-session", () => ({
	getServerSession: mocks.getServerSession,
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

function contactInfoInput(values: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		label: "Email",
		value: "mailto:hello@example.com",
		...values,
	};
}

describe("contact info admin Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getContactInfoAdmin.mockResolvedValue([]);
		mocks.createAdminContactInfo.mockResolvedValue({ id: "contact-1" });
		mocks.updateAdminContactInfo.mockResolvedValue({ id: "contact-1" });
		mocks.deleteAdminContactInfo.mockResolvedValue({ id: "contact-1" });
	});

	it("checks a session before every admin action", async () => {
		mocks.getServerSession.mockResolvedValue(null);

		await expect(getContactInfoAdmin()).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(createContactInfo(contactInfoInput())).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(updateContactInfo("contact-1", contactInfoInput())).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(deleteContactInfo("contact-1")).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
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

	it("validates object input and creates contact information with a capitalized label", async () => {
		await expect(createContactInfo(contactInfoInput({ label: "github profile" }))).resolves.toEqual({
			data: { id: "contact-1" },
		});
		expect(mocks.createAdminContactInfo).toHaveBeenCalledWith({
			icon: null,
			label: "Github Profile",
			value: "mailto:hello@example.com",
		});
	});

	it("returns field errors without creating invalid contact information", async () => {
		const result = await createContactInfo(contactInfoInput({ label: "", value: "" }));

		expect(result).toEqual({ error: { fields: { label: "Wajib diisi.", value: "Wajib diisi." } } });
		expect(mocks.createAdminContactInfo).not.toHaveBeenCalled();
	});

	it("rejects a value that is not a URL", async () => {
		const result = await createContactInfo(contactInfoInput({ value: "hello@example.com" }));

		expect(result).toEqual({ error: { fields: { value: "URL tidak valid." } } });
		expect(mocks.createAdminContactInfo).not.toHaveBeenCalled();
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

	it("maps unavailable contact information to the action contracts", async () => {
		mocks.updateAdminContactInfo.mockResolvedValue(null);
		mocks.deleteAdminContactInfo.mockResolvedValue(null);

		await expect(updateContactInfo("missing", contactInfoInput())).resolves.toEqual({
			error: { fields: { _form: "Info kontak tidak ditemukan." } },
		});
		await expect(deleteContactInfo("missing")).resolves.toEqual({ error: { message: "Info kontak tidak ditemukan." } });
	});
});
