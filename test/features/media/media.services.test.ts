import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictException, ValidationException } from "@/lib/server-action-exception/exceptions";

const mocks = vi.hoisted(() => ({
	createMediaFolderRecord: vi.fn(),
	createMediaRecord: vi.fn(),
	countMediaGallery: vi.fn(),
	deleteEmptyMediaFolderRecord: vi.fn(),
	deleteMediaObject: vi.fn(),
	deleteMediaRecord: vi.fn(),
	findMediaForDelete: vi.fn(),
	findMediaFolderById: vi.fn(),
	findMediaFolders: vi.fn(),
	findMediaGallery: vi.fn(),
	uploadMediaObject: vi.fn(),
}));
vi.mock("@/features/media/media.repository", () => mocks);

import {
	createAdminMediaFolder,
	deleteAdminMedia,
	deleteAdminMediaFolder,
	getMediaGalleryPage,
	uploadAdminMedia,
} from "@/features/media/media.services";

function uploadFormData(folderId = ""): FormData {
	const formData = new FormData();
	formData.set("file", new File(["x"], "x.png", { type: "image/png" }));
	formData.set("folderId", folderId);
	return formData;
}

describe("media services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.createMediaRecord.mockResolvedValue({ id: "media-1", url: "https://cdn.example/media/x.png" });
		mocks.countMediaGallery.mockResolvedValue(1);
		mocks.createMediaFolderRecord.mockResolvedValue({ id: "folder-1", name: "Portfolio" });
		mocks.deleteEmptyMediaFolderRecord.mockResolvedValue({ count: 1 });
		mocks.deleteMediaRecord.mockResolvedValue({ id: "media-1" });
	});
	it("paginates gallery media, serializes dates, and stores an uploaded image", async () => {
		mocks.findMediaGallery.mockResolvedValue([
			{
				createdAt: new Date("2026-07-18T00:00:00.000Z"),
				fileName: "x.png",
				id: "media-1",
				mimeType: "image/png",
				size: 1,
				url: "https://cdn.example/media/x.png",
			},
		]);
		await expect(getMediaGalleryPage({ folderId: null, page: 1 })).resolves.toEqual({
			currentPage: 1,
			media: [expect.objectContaining({ createdAt: "2026-07-18T00:00:00.000Z" })],
			totalPages: 1,
		});
		expect(mocks.findMediaGallery).toHaveBeenCalledWith({ folderId: null, skip: 0, take: 24 });
		await uploadAdminMedia(uploadFormData());
		expect(mocks.uploadMediaObject).toHaveBeenCalled();
	});
	it("deletes the R2 object before its metadata record", async () => {
		mocks.findMediaForDelete.mockResolvedValue({ id: "media-1", objectKey: "media/x.png" });
		await expect(deleteAdminMedia("media-1")).resolves.toEqual({ id: "media-1" });
		expect(mocks.deleteMediaObject).toHaveBeenCalledWith("media/x.png");
	});
	it("creates folders and stores the selected folder on uploads", async () => {
		mocks.findMediaFolders.mockResolvedValue([]);
		mocks.findMediaFolderById.mockResolvedValue({ id: "folder-1" });

		await expect(createAdminMediaFolder({ name: "Portfolio" })).resolves.toEqual({ id: "folder-1", name: "Portfolio" });
		await uploadAdminMedia(uploadFormData("folder-1"));

		expect(mocks.createMediaRecord).toHaveBeenCalledWith(expect.objectContaining({ folderId: "folder-1" }));
	});
	it("deletes only empty folders", async () => {
		await expect(deleteAdminMediaFolder("folder-1")).resolves.toEqual({ id: "folder-1" });

		mocks.deleteEmptyMediaFolderRecord.mockResolvedValue({ count: 0 });
		mocks.findMediaFolderById.mockResolvedValue({ id: "folder-1" });
		await expect(deleteAdminMediaFolder("folder-1")).rejects.toBeInstanceOf(ConflictException);

		await expect(createAdminMediaFolder({ name: "" })).rejects.toBeInstanceOf(ValidationException);
	});
});
