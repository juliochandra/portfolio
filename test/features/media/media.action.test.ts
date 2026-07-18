import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteAdminMedia: vi.fn(),
	getMediaGallery: vi.fn(),
	getServerSession: vi.fn(),
	uploadAdminMedia: vi.fn(),
}));
vi.mock("@/shared/auth/server-session", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/features/media/media.services", () => ({
	deleteAdminMedia: mocks.deleteAdminMedia,
	getMediaGallery: mocks.getMediaGallery,
	uploadAdminMedia: mocks.uploadAdminMedia,
}));

import { deleteMedia, getMediaGallery, uploadMedia } from "@/features/media/media.action";

describe("media admin actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.uploadAdminMedia.mockResolvedValue({ id: "media-1", url: "https://cdn.example/media/a.jpg" });
		mocks.deleteAdminMedia.mockResolvedValue({ id: "media-1" });
	});
	it("requires a session and validates the uploaded file", async () => {
		mocks.getServerSession.mockResolvedValue(null);
		await expect(getMediaGallery()).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		mocks.getServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		const invalid = new FormData();
		invalid.set("file", new File(["x"], "x.gif", { type: "image/gif" }));
		await expect(uploadMedia(invalid)).resolves.toEqual({
			error: { fields: { file: "Jenis berkas harus JPG, PNG, atau WebP." } },
		});
	});
	it("uploads valid files and deletes media", async () => {
		const formData = new FormData();
		formData.set("file", new File(["x"], "x.png", { type: "image/png" }));
		await expect(uploadMedia(formData)).resolves.toEqual({ data: { id: "media-1", url: "https://cdn.example/media/a.jpg" } });
		await expect(deleteMedia("media-1")).resolves.toEqual({ data: { id: "media-1" } });
	});
});
