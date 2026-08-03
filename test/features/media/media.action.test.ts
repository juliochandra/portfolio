import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	ConflictException,
	InternalServerErrorException,
	UnauthorizedException,
	ValidationException,
} from "@/lib/server-action-exception/exceptions";

const mocks = vi.hoisted(() => ({
	createAdminMediaFolder: vi.fn(),
	deleteAdminMedia: vi.fn(),
	deleteAdminMediaFolder: vi.fn(),
	getMediaFolders: vi.fn(),
	getMediaGalleryPage: vi.fn(),
	requireServerSession: vi.fn(),
	uploadAdminMedia: vi.fn(),
}));

vi.mock("@/lib/auth/server-session", () => ({
	requireServerSession: mocks.requireServerSession,
}));
vi.mock("@/features/media/media.services", () => ({
	createAdminMediaFolder: mocks.createAdminMediaFolder,
	deleteAdminMedia: mocks.deleteAdminMedia,
	deleteAdminMediaFolder: mocks.deleteAdminMediaFolder,
	getMediaFolders: mocks.getMediaFolders,
	getMediaGalleryPage: mocks.getMediaGalleryPage,
	uploadAdminMedia: mocks.uploadAdminMedia,
}));

import {
	createMediaFolder,
	deleteMedia,
	deleteMediaFolder,
	getMediaFolders,
	getMediaGalleryPage,
	uploadMedia,
} from "@/features/media/media.action";

function uploadFormData(): FormData {
	const formData = new FormData();
	formData.set("file", new File(["x"], "x.png", { type: "image/png" }));
	return formData;
}

describe("media admin actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.requireServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getMediaFolders.mockResolvedValue([]);
		mocks.getMediaGalleryPage.mockResolvedValue({ currentPage: 1, media: [], totalPages: 1 });
		mocks.createAdminMediaFolder.mockResolvedValue({ id: "folder-1", name: "Portfolio" });
		mocks.uploadAdminMedia.mockResolvedValue({ id: "media-1", url: "https://cdn.example/media/a.jpg" });
		mocks.deleteAdminMedia.mockResolvedValue({ id: "media-1" });
		mocks.deleteAdminMediaFolder.mockResolvedValue({ id: "folder-1" });
	});

	it("requires a session before calling media services", async () => {
		mocks.requireServerSession.mockRejectedValue(new UnauthorizedException("UNAUTHORIZED"));

		await expect(getMediaFolders()).resolves.toEqual({
			error: { code: "UNAUTHORIZED", message: "UNAUTHORIZED" },
		});
		expect(mocks.getMediaFolders).not.toHaveBeenCalled();
	});

	it("returns media gallery and folders for an authenticated admin", async () => {
		await expect(getMediaGalleryPage({ folderId: "folder-1", page: 1 })).resolves.toEqual({
			data: { currentPage: 1, media: [], totalPages: 1 },
		});
		await expect(getMediaFolders()).resolves.toEqual({ data: [] });
	});

	it("forwards folder and upload input to the service", async () => {
		const formData = uploadFormData();

		await expect(createMediaFolder({ name: "Portfolio" })).resolves.toEqual({
			data: { id: "folder-1", name: "Portfolio" },
		});
		expect(mocks.createAdminMediaFolder).toHaveBeenCalledWith({ name: "Portfolio" });

		await expect(uploadMedia(formData)).resolves.toEqual({
			data: { id: "media-1", url: "https://cdn.example/media/a.jpg" },
		});
		expect(mocks.uploadAdminMedia).toHaveBeenCalledWith(formData);
	});

	it("maps validation errors from the service", async () => {
		mocks.createAdminMediaFolder.mockRejectedValue(new ValidationException({ name: "Nama folder sudah digunakan." }));

		await expect(createMediaFolder({ name: "Portfolio" })).resolves.toEqual({
			error: {
				code: "VALIDATION_ERROR",
				fields: { name: "Nama folder sudah digunakan." },
				message: "Input tidak valid.",
			},
		});
	});

	it("maps failed uploads and non-empty folders", async () => {
		mocks.uploadAdminMedia.mockRejectedValue(new InternalServerErrorException("Gagal mengunggah gambar. Coba lagi."));
		mocks.deleteAdminMediaFolder.mockRejectedValue(new ConflictException("Folder hanya dapat dihapus jika kosong."));

		await expect(uploadMedia(uploadFormData())).resolves.toEqual({
			error: { code: "INTERNAL_SERVER_ERROR", message: "Gagal mengunggah gambar. Coba lagi." },
		});
		await expect(deleteMediaFolder("folder-1")).resolves.toEqual({
			error: { code: "CONFLICT", message: "Folder hanya dapat dihapus jika kosong." },
		});
	});

	it("deletes media and empty folders", async () => {
		await expect(deleteMedia("media-1")).resolves.toEqual({ data: { id: "media-1" } });
		await expect(deleteMediaFolder("folder-1")).resolves.toEqual({ data: { id: "folder-1" } });
	});
});
