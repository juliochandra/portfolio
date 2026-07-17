import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
	findPostBySlug: vi.fn(),
	findPosts: vi.fn(),
}));

vi.mock("@/features/posts/posts.repository", () => ({
	findPostBySlug: mocks.findPostBySlug,
	findPosts: mocks.findPosts,
}));

import { getPublishedPostBySlug, getPublishedPosts } from "@/features/posts/posts.services";

const publishedAt = new Date("2026-07-17T02:00:00.000Z");
const postRecord = {
	description: "Ringkasan tulisan",
	id: "post-1",
	publishedAt,
	slug: "memahami-server-actions",
	thumbnailImage: null,
	title: "Memahami Server Actions",
};

describe("post public services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findPosts.mockResolvedValue([postRecord]);
	});

	it("queries published posts and serializes their publication date", async () => {
		const posts = await getPublishedPosts({ limit: 3 });

		expect(mocks.findPosts).toHaveBeenCalledWith({
			limit: 3,
			status: PublishStatus.PUBLISHED,
		});
		expect(posts).toEqual([
			{
				...postRecord,
				publishedAt: publishedAt.toISOString(),
			},
		]);
	});

	it("omits inconsistent published records without a publication date", async () => {
		mocks.findPosts.mockResolvedValue([{ ...postRecord, publishedAt: null }]);

		await expect(getPublishedPosts()).resolves.toEqual([]);
	});

	it("returns published post detail with stored reading time and tags", async () => {
		mocks.findPostBySlug.mockResolvedValue({
			...postRecord,
			content: "Isi lengkap tulisan.",
			readingTime: 7,
			tags: [{ name: "Next.js" }],
		});

		const post = await getPublishedPostBySlug("memahami-server-actions");

		expect(mocks.findPostBySlug).toHaveBeenCalledWith({
			slug: "memahami-server-actions",
			status: PublishStatus.PUBLISHED,
		});
		expect(post).toMatchObject({
			content: "Isi lengkap tulisan.",
			publishedAt: publishedAt.toISOString(),
			readingTime: 7,
			tags: [{ name: "Next.js" }],
		});
	});

	it("returns null when the post is unavailable or has no publication date", async () => {
		mocks.findPostBySlug.mockResolvedValue(null);
		await expect(getPublishedPostBySlug("missing-post")).resolves.toBeNull();

		mocks.findPostBySlug.mockResolvedValue({
			...postRecord,
			content: "Isi lengkap tulisan.",
			publishedAt: null,
			readingTime: 7,
			tags: [],
		});
		await expect(getPublishedPostBySlug("inconsistent-post")).resolves.toBeNull();
	});
});
