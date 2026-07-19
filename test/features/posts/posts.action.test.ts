import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getPublishedPostBySlug: vi.fn(),
	getPublishedPosts: vi.fn(),
}));

vi.mock("@/features/posts/posts.services", () => ({
	getPublishedPostBySlug: mocks.getPublishedPostBySlug,
	getPublishedPosts: mocks.getPublishedPosts,
}));

import { getPostBySlug, getPosts } from "@/features/posts/posts.action";

const postListItem = {
	description: "Ringkasan tulisan",
	id: "post-1",
	publishedAt: "2026-07-17T02:00:00.000Z",
	readingTime: 7,
	slug: "memahami-server-actions",
	tags: [{ name: "Next.js" }],
	thumbnailImage: null,
	title: "Memahami Server Actions",
};

const postDetail = {
	...postListItem,
	content: "Isi lengkap tulisan.",
};

describe("post public Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getPublishedPosts.mockResolvedValue([postListItem]);
		mocks.getPublishedPostBySlug.mockResolvedValue(postDetail);
	});

	it("returns all published posts when limit is omitted", async () => {
		await expect(getPosts()).resolves.toEqual({ data: [postListItem] });
		expect(mocks.getPublishedPosts).toHaveBeenCalledWith(undefined);
	});

	it("passes a valid limit to the post service", async () => {
		await expect(getPosts({ limit: 3 })).resolves.toEqual({ data: [postListItem] });
		expect(mocks.getPublishedPosts).toHaveBeenCalledWith({ limit: 3 });
	});

	it("returns an empty list as a successful result", async () => {
		mocks.getPublishedPosts.mockResolvedValue([]);

		await expect(getPosts()).resolves.toEqual({ data: [] });
	});

	it("rejects an invalid limit before calling the service", async () => {
		await expect(getPosts({ limit: 0 })).rejects.toThrow("Parameter tulisan tidak valid.");
		expect(mocks.getPublishedPosts).not.toHaveBeenCalled();
	});

	it("returns a published post by its normalized slug", async () => {
		await expect(getPostBySlug("  memahami-server-actions  ")).resolves.toEqual({
			data: postDetail,
		});
		expect(mocks.getPublishedPostBySlug).toHaveBeenCalledWith("memahami-server-actions");
	});

	it("returns the same error for an invalid or unavailable slug", async () => {
		const invalidSlug = await getPostBySlug("   ");
		mocks.getPublishedPostBySlug.mockResolvedValue(null);
		const unavailablePost = await getPostBySlug("draft-post");

		expect(invalidSlug).toEqual({ error: { message: "Tulisan tidak ditemukan." } });
		expect(unavailablePost).toEqual(invalidSlug);
	});
});
