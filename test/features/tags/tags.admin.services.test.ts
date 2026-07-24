import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createTagRecord: vi.fn(),
	deleteTagRecord: vi.fn(),
	findTagForAdmin: vi.fn(),
	isTagNameAvailable: vi.fn(),
	isTagSlugAvailable: vi.fn(),
	updateTagRecord: vi.fn(),
}));
vi.mock("@/features/tags/tags.repository", () => ({
	createTagRecord: mocks.createTagRecord,
	deleteTagRecord: mocks.deleteTagRecord,
	findTagForAdmin: mocks.findTagForAdmin,
	findTagsAdmin: vi.fn(),
	isTagNameAvailable: mocks.isTagNameAvailable,
	isTagSlugAvailable: mocks.isTagSlugAvailable,
	updateTagRecord: mocks.updateTagRecord,
}));

import { createAdminTag, deleteAdminTag, updateAdminTag } from "@/features/tags/tags.services";

describe("tag admin services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.isTagNameAvailable.mockResolvedValue(true);
		mocks.isTagSlugAvailable.mockResolvedValue(true);
		mocks.createTagRecord.mockResolvedValue({ id: "tag-1" });
		mocks.updateTagRecord.mockResolvedValue({ id: "tag-1" });
		mocks.deleteTagRecord.mockResolvedValue({ id: "tag-1" });
	});
	it("generates a unique slug and rejects duplicate names", async () => {
		await expect(createAdminTag({ name: "React" })).resolves.toEqual({ id: "tag-1" });
		expect(mocks.createTagRecord).toHaveBeenCalledWith({ name: "React", slug: "react" });
		mocks.isTagNameAvailable.mockResolvedValue(false);
		await expect(createAdminTag({ name: "React" })).resolves.toBe("name_taken");
	});
	it("updates existing tags and deletes only the tag record", async () => {
		mocks.findTagForAdmin.mockResolvedValue({ id: "tag-1", name: "React", slug: "react" });
		await expect(updateAdminTag("tag-1", { name: "Vue" })).resolves.toEqual({ id: "tag-1" });
		expect(mocks.updateTagRecord).toHaveBeenCalledWith("tag-1", { name: "Vue", slug: "vue" });
		await expect(deleteAdminTag("tag-1")).resolves.toEqual({ id: "tag-1" });
		expect(mocks.deleteTagRecord).toHaveBeenCalledWith("tag-1");
	});
});
