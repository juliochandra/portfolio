import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ create: vi.fn(), delete: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() }));
vi.mock("@/shared/database/prisma", () => ({
	prisma: {
		tag: {
			create: mocks.create,
			delete: mocks.delete,
			findMany: mocks.findMany,
			findUnique: mocks.findUnique,
			update: mocks.update,
		},
	},
}));

import { deleteTagRecord, findTagsAdmin } from "@/features/tags/tags.repository";

describe("tag admin repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
		mocks.delete.mockResolvedValue({ id: "tag-1" });
	});
	it("lists tags and deletes only the tag row", async () => {
		await findTagsAdmin();
		expect(mocks.findMany).toHaveBeenCalledWith({ select: { id: true, name: true } });
		await expect(deleteTagRecord("tag-1")).resolves.toEqual({ id: "tag-1" });
		expect(mocks.delete).toHaveBeenCalledWith({ select: { id: true }, where: { id: "tag-1" } });
	});
});
