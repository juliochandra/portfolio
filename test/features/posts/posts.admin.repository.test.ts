import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	countPostsAdmin,
	createPostRecord,
	findPostDetailForAdmin,
	findPostsAdmin,
	isPostSlugAvailable,
	updatePostRecord,
} from "@/features/posts/posts.repository";
import { PublishStatus } from "@/shared/publish-status";

const mocks = vi.hoisted(() => ({
	create: vi.fn(),
	count: vi.fn(),
	delete: vi.fn(),
	findMany: vi.fn(),
	findUnique: vi.fn(),
	update: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
	prisma: {
		post: {
			count: mocks.count,
			create: mocks.create,
			delete: mocks.delete,
			findMany: mocks.findMany,
			findUnique: mocks.findUnique,
			update: mocks.update,
		},
	},
}));

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
		mocks.count.mockResolvedValue(0);
		mocks.create.mockResolvedValue({ id: "post-1", slug: "tulisan-baru" });
		mocks.update.mockResolvedValue({ id: "post-1", slug: "tulisan-baru" });
	});

	it("lists all statuses ordered by newest creation", async () => {
		await findPostsAdmin();

		expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { createdAt: "desc" } }));
	});

	it("counts posts for pagination", async () => {
		await countPostsAdmin();

		expect(mocks.count).toHaveBeenCalledWith();
	});

	it("applies pagination to the admin post list", async () => {
		await findPostsAdmin({ skip: 10, take: 10 });

		expect(mocks.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ orderBy: { createdAt: "desc" }, skip: 10, take: 10 }),
		);
	});

	it("gets an admin post detail with tag IDs for the edit form", async () => {
		mocks.findUnique.mockResolvedValue(null);
		await findPostDetailForAdmin("post-1");

		expect(mocks.findUnique).toHaveBeenCalledWith({
			select: expect.objectContaining({ content: true, tags: { select: { id: true } } }),
			where: { id: "post-1" },
		});
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
