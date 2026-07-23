import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createAdminMediaFolder: vi.fn(),
	deleteAdminMedia: vi.fn(),
	getMediaFolders: vi.fn(),
	getMediaGallery: vi.fn(),
	getServerSession: vi.fn(),
	uploadAdminMedia: vi.fn(),
}));
vi.mock("@/shared/auth/server-session", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/features/media/media.services", () => ({
	createAdminMediaFolder: mocks.createAdminMediaFolder,
	deleteAdminMedia: mocks.deleteAdminMedia,
	getMediaFolders: mocks.getMediaFolders,
	getMediaGallery: mocks.getMediaGallery,
	uploadAdminMedia: mocks.uploadAdminMedia,
}));

import { createMediaFolder, deleteMedia, getMediaFolders, getMediaGallery, uploadMedia } from "@/features/media/media.action";

describe("media admin actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getMediaFolders.mockResolvedValue([]);
		mocks.createAdminMediaFolder.mockResolvedValue({ id: "folder-1", name: "Portfolio" });
		mocks.uploadAdminMedia.mockResolvedValue({ id: "media-1", url: "https://cdn.example/media/a.jpg" });
		mocks.deleteAdminMedia.mockResolvedValue({ id: "media-1" });
	});
	it("requires a session and validates the uploaded file", async () => {
		mocks.getServerSession.mockResolvedValue(null);
		await expect(getMediaGallery()).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(getMediaFolders()).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
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
	it("creates and lists media folders for an authenticated admin", async () => {
		await expect(createMediaFolder({ name: "Portfolio" })).resolves.toEqual({ data: { id: "folder-1", name: "Portfolio" } });
		await expect(getMediaFolders()).resolves.toEqual({ data: [] });

		mocks.createAdminMediaFolder.mockResolvedValue("name_taken");
		await expect(createMediaFolder({ name: "Portfolio" })).resolves.toEqual({
			error: { fields: { name: "Nama folder sudah digunakan." } },
		});
	});
});
