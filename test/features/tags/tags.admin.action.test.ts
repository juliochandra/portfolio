import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException, UnauthorizedException, ValidationException } from "@/lib/server-action-exception/exceptions";

const mocks = vi.hoisted(() => ({
	createAdminTag: vi.fn(),
	deleteAdminTag: vi.fn(),
	getTagsAdmin: vi.fn(),
	requireServerSession: vi.fn(),
	updateAdminTag: vi.fn(),
}));

vi.mock("@/lib/auth/server-session", () => ({ requireServerSession: mocks.requireServerSession }));
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
		mocks.requireServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getTagsAdmin.mockResolvedValue([{ id: "tag-1", name: "React" }]);
		mocks.createAdminTag.mockResolvedValue({ id: "tag-1" });
		mocks.updateAdminTag.mockResolvedValue({ id: "tag-1" });
		mocks.deleteAdminTag.mockResolvedValue({ id: "tag-1" });
	});

	it("checks a session before every admin action", async () => {
		mocks.requireServerSession.mockRejectedValue(new UnauthorizedException());

		await expect(getTagsAdmin()).resolves.toEqual({
			error: { code: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
		});
		await expect(createTag({ name: "React" })).resolves.toEqual({
			error: { code: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
		});
	});

	it("forwards authenticated admin requests to the services", async () => {
		await expect(getTagsAdmin()).resolves.toEqual({ data: [{ id: "tag-1", name: "React" }] });
		await expect(createTag({ name: "React" })).resolves.toEqual({ data: { id: "tag-1" } });
		expect(mocks.createAdminTag).toHaveBeenCalledWith({ name: "React" });
		await expect(updateTag("tag-1", { name: "Vue" })).resolves.toEqual({ data: { id: "tag-1" } });
		await expect(deleteTag("tag-1")).resolves.toEqual({ data: { id: "tag-1" } });
	});

	it("maps validation and not-found errors from services", async () => {
		mocks.createAdminTag.mockRejectedValue(new ValidationException({ name: "Nama tag sudah digunakan." }));
		await expect(createTag({ name: "React" })).resolves.toEqual({
			error: {
				code: "VALIDATION_ERROR",
				fields: { name: "Nama tag sudah digunakan." },
				message: "Input tidak valid.",
			},
		});

		mocks.deleteAdminTag.mockRejectedValue(new NotFoundException("Tag tidak ditemukan."));
		await expect(deleteTag("missing")).resolves.toEqual({
			error: { code: "NOT_FOUND", message: "Tag tidak ditemukan." },
		});
	});
});
