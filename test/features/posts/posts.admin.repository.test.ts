import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
	create: vi.fn(),
	delete: vi.fn(),
	findMany: vi.fn(),
	findUnique: vi.fn(),
	update: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
	prisma: {
		post: {
			create: mocks.create,
			delete: mocks.delete,
			findMany: mocks.findMany,
			findUnique: mocks.findUnique,
			update: mocks.update,
		},
	},
}));

import { createPostRecord, findPostsAdmin, isPostSlugAvailable, updatePostRecord } from "@/features/posts/posts.repository";

const input = {
	content: "Isi tulisan",
	description: null,
	publishedAt: null,
	readingTime: 1,
	slug: "tulisan-baru",
	status: PublishStatus.DRAFT,
	tagIds: ["tag-1"],
	thumbnailImage: "https://cdn.example/posts/image.png",
	title: "Tulisan Baru",
};

describe("post admin repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
		mocks.create.mockResolvedValue({ id: "post-1", slug: "tulisan-baru" });
		mocks.update.mockResolvedValue({ id: "post-1", slug: "tulisan-baru" });
	});

	it("lists all statuses ordered by newest creation", async () => {
		await findPostsAdmin();

		expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { createdAt: "desc" } }));
	});

	it("creates a post with connected tags and its thumbnail URL", async () => {
		await createPostRecord(input);

		expect(mocks.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					tags: { connect: [{ id: "tag-1" }] },
					thumbnailImage: "https://cdn.example/posts/image.png",
				}),
				select: { id: true, slug: true },
			}),
		);
	});

	it("replaces tags during an update", async () => {
		await updatePostRecord("post-1", input);

		expect(mocks.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ tags: { set: [{ id: "tag-1" }] } }),
				where: { id: "post-1" },
			}),
		);
	});

	it("checks slug availability", async () => {
		mocks.findUnique.mockResolvedValue({ id: "post-2" });
		await expect(isPostSlugAvailable("tulisan-baru")).resolves.toBe(false);
		await expect(isPostSlugAvailable("tulisan-baru", "post-2")).resolves.toBe(true);
	});
});
