import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createAdminTag: vi.fn(),
	deleteAdminTag: vi.fn(),
	getServerSession: vi.fn(),
	getTagsAdmin: vi.fn(),
	updateAdminTag: vi.fn(),
}));
vi.mock("@/shared/auth/server-session", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/features/tags/tags.services", () => ({
	createAdminTag: mocks.createAdminTag,
	deleteAdminTag: mocks.deleteAdminTag,
	getTagsAdmin: mocks.getTagsAdmin,
	updateAdminTag: mocks.updateAdminTag,
}));

import { createTag, deleteTag, getTagsAdmin, updateTag } from "@/features/tags/tags.action";

describe("tag admin Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.createAdminTag.mockResolvedValue({ id: "tag-1" });
		mocks.updateAdminTag.mockResolvedValue({ id: "tag-1" });
		mocks.deleteAdminTag.mockResolvedValue({ id: "tag-1" });
	});
	it("checks a session before every admin action", async () => {
		mocks.getServerSession.mockResolvedValue(null);
		await expect(getTagsAdmin()).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(createTag({ name: "React" })).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(updateTag("tag-1", { name: "React" })).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(deleteTag("tag-1")).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
	});
	it("validates, creates, updates, deletes, and maps duplicate names", async () => {
		await expect(createTag({ name: " React " })).resolves.toEqual({ data: { id: "tag-1" } });
		expect(mocks.createAdminTag).toHaveBeenCalledWith({ name: "React" });
		await expect(createTag({ name: "" })).resolves.toEqual({ error: { fields: { name: "Wajib diisi." } } });
		mocks.createAdminTag.mockResolvedValue("name_taken");
		await expect(createTag({ name: "React" })).resolves.toEqual({ error: { fields: { name: "Nama tag sudah digunakan." } } });
		await expect(updateTag("tag-1", { name: "Vue" })).resolves.toEqual({ data: { id: "tag-1" } });
		await expect(deleteTag("tag-1")).resolves.toEqual({ data: { id: "tag-1" } });
	});
});
