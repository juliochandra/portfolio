import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	create: vi.fn(),
	delete: vi.fn(),
	findMany: vi.fn(),
	findUnique: vi.fn(),
	update: vi.fn(),
}));

vi.mock("@/lib/database/prisma", () => ({
	prisma: {
		contactInfo: {
			create: mocks.create,
			delete: mocks.delete,
			findMany: mocks.findMany,
			findUnique: mocks.findUnique,
			update: mocks.update,
		},
	},
}));

import { createContactInfoRecord, findContactInfoAdmin, updateContactInfoRecord } from "@/features/contact/contact.repository";

const input = {
	icon: null,
	label: "Email",
	value: "hello@example.com",
};

describe("contact info admin repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
		mocks.create.mockResolvedValue({ id: "contact-1" });
		mocks.update.mockResolvedValue({ id: "contact-1" });
	});

	it("lists all contact information using the admin projection", async () => {
		await findContactInfoAdmin();

		expect(mocks.findMany).toHaveBeenCalledWith({
			select: { icon: true, id: true, label: true, value: true },
		});
	});

	it("creates and updates one contact information row", async () => {
		await createContactInfoRecord(input);
		expect(mocks.create).toHaveBeenCalledWith({ data: input, select: { id: true } });

		await updateContactInfoRecord("contact-1", input);
		expect(mocks.update).toHaveBeenCalledWith({ data: input, select: { id: true }, where: { id: "contact-1" } });
	});
});
