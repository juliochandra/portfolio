import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createMediaRecord: vi.fn(),
	deleteMediaObject: vi.fn(),
	deleteMediaRecord: vi.fn(),
	findMediaForDelete: vi.fn(),
	findMediaGallery: vi.fn(),
	uploadMediaObject: vi.fn(),
}));
vi.mock("@/features/media/media.repository", () => mocks);

import { deleteAdminMedia, getMediaGallery, uploadAdminMedia } from "@/features/media/media.services";

describe("media services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.createMediaRecord.mockResolvedValue({ id: "media-1", url: "https://cdn.example/media/x.png" });
		mocks.deleteMediaRecord.mockResolvedValue({ id: "media-1" });
	});
	it("serializes gallery dates and stores an uploaded image", async () => {
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
		await expect(getMediaGallery()).resolves.toEqual([expect.objectContaining({ createdAt: "2026-07-18T00:00:00.000Z" })]);
		await uploadAdminMedia({ file: new File(["x"], "x.png", { type: "image/png" }) });
		expect(mocks.uploadMediaObject).toHaveBeenCalled();
	});
	it("deletes the R2 object before its metadata record", async () => {
		mocks.findMediaForDelete.mockResolvedValue({ id: "media-1", objectKey: "media/x.png" });
		await expect(deleteAdminMedia("media-1")).resolves.toEqual({ id: "media-1" });
		expect(mocks.deleteMediaObject).toHaveBeenCalledWith("media/x.png");
	});
});
