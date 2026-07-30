import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/shared/publish-status";
import type { RichTextDocument } from "@/shared/tiptap/json";

const content: RichTextDocument = {
	content: [{ content: [{ text: "Isi lengkap tulisan.", type: "text" }], type: "paragraph" }],
	type: "doc",
};

const serializedContent = JSON.stringify(content);

const mocks = vi.hoisted(() => ({
	findPostBySlug: vi.fn(),
	findNextPublishedPost: vi.fn(),
	findPreviousPublishedPost: vi.fn(),
	findPosts: vi.fn(),
}));

vi.mock("@/features/posts/posts.repository", () => ({
	findPostBySlug: mocks.findPostBySlug,
	findNextPublishedPost: mocks.findNextPublishedPost,
	findPreviousPublishedPost: mocks.findPreviousPublishedPost,
	findPosts: mocks.findPosts,
}));

import { getPublishedPostBySlug, getPublishedPosts } from "@/features/posts/posts.services";

const publishedAt = new Date("2026-07-17T02:00:00.000Z");
const postRecord = {
	description: "Ringkasan tulisan",
	id: "post-1",
	publishedAt,
	readingTime: 7,
	slug: "memahami-server-actions",
	tags: [{ name: "Next.js" }],
	thumbnailImage: null,
	title: "Memahami Server Actions",
};

describe("post public services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findPosts.mockResolvedValue([postRecord]);
		mocks.findNextPublishedPost.mockResolvedValue(null);
		mocks.findPreviousPublishedPost.mockResolvedValue(null);
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
			content: serializedContent,
		});

		const post = await getPublishedPostBySlug("memahami-server-actions");

		expect(mocks.findPostBySlug).toHaveBeenCalledWith({
			slug: "memahami-server-actions",
			status: PublishStatus.PUBLISHED,
		});
		expect(post).toMatchObject({
			content,
			nextPost: null,
			publishedAt: publishedAt.toISOString(),
			prevPost: null,
			readingTime: 7,
			tags: [{ name: "Next.js" }],
		});
		expect(mocks.findPreviousPublishedPost).toHaveBeenCalledWith({ publishedAt });
		expect(mocks.findNextPublishedPost).toHaveBeenCalledWith({ publishedAt });
	});

	it("includes the adjacent published posts in detail navigation", async () => {
		mocks.findPostBySlug.mockResolvedValue({ ...postRecord, content: serializedContent });
		mocks.findPreviousPublishedPost.mockResolvedValue({ slug: "tulisan-baru", title: "Tulisan Baru" });
		mocks.findNextPublishedPost.mockResolvedValue({ slug: "tulisan-lama", title: "Tulisan Lama" });

		await expect(getPublishedPostBySlug(postRecord.slug)).resolves.toMatchObject({
			nextPost: { slug: "tulisan-lama", title: "Tulisan Lama" },
			prevPost: { slug: "tulisan-baru", title: "Tulisan Baru" },
		});
	});

	it("returns null when the post is unavailable or has no publication date", async () => {
		mocks.findPostBySlug.mockResolvedValue(null);
		await expect(getPublishedPostBySlug("missing-post")).resolves.toBeNull();

		mocks.findPostBySlug.mockResolvedValue({
			...postRecord,
			content: serializedContent,
			publishedAt: null,
		});
		await expect(getPublishedPostBySlug("inconsistent-post")).resolves.toBeNull();
	});
});
