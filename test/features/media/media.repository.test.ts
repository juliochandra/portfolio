import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteObject: vi.fn(),
	getCloudflareContext: vi.fn(),
	putObject: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
	getCloudflareContext: mocks.getCloudflareContext,
}));

vi.mock("@/shared/database/prisma", () => ({ prisma: {} }));

import { deleteMediaObject, uploadMediaObject } from "@/features/media/media.repository";

describe("media repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getCloudflareContext.mockReturnValue({
			env: {
				PORTFOLIO_MEDIA: {
					delete: mocks.deleteObject,
					put: mocks.putObject,
				},
			},
		});
	});

	it("uploads a media file through the native R2 binding", async () => {
		const contents = new ArrayBuffer(3);
		const file = {
			arrayBuffer: vi.fn().mockResolvedValue(contents),
			type: "image/png",
		} as unknown as File;

		await uploadMediaObject("media/example.png", file);

		expect(mocks.putObject).toHaveBeenCalledWith("media/example.png", contents, {
			httpMetadata: { contentType: "image/png" },
		});
	});

	it("deletes a media object through the native R2 binding", async () => {
		await deleteMediaObject("media/example.png");

		expect(mocks.deleteObject).toHaveBeenCalledWith("media/example.png");
	});
});
