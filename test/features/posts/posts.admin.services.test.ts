import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
	createPostRecord: vi.fn(),
	deletePostRecord: vi.fn(),
	findPostForAdmin: vi.fn(),
	findPostsAdmin: vi.fn(),
	isPostSlugAvailable: vi.fn(),
	updatePostRecord: vi.fn(),
}));

vi.mock("@/features/posts/posts.repository", () => ({
	createPostRecord: mocks.createPostRecord,
	deletePostRecord: mocks.deletePostRecord,
	findPostBySlug: vi.fn(),
	findPostForAdmin: mocks.findPostForAdmin,
	findPosts: vi.fn(),
	findPostsAdmin: mocks.findPostsAdmin,
	isPostSlugAvailable: mocks.isPostSlugAvailable,
	updatePostRecord: mocks.updatePostRecord,
}));

import {
	calculateReadingTime,
	createAdminPost,
	deleteAdminPost,
	getPostsAdmin,
	updateAdminPost,
} from "@/features/posts/posts.services";

const input = {
	content: "Isi tulisan",
	description: null,
	status: PublishStatus.PUBLISHED,
	tagIds: ["tag-1"],
	thumbnailImage: null,
	title: "Tulisan Baru",
};

describe("post admin services", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-07-17T10:00:00.000Z"));
		vi.clearAllMocks();
		mocks.isPostSlugAvailable.mockResolvedValue(true);
		mocks.createPostRecord.mockResolvedValue({ id: "post-1", slug: "tulisan-baru" });
		mocks.updatePostRecord.mockResolvedValue({ id: "post-1", slug: "tulisan-baru" });
		mocks.deletePostRecord.mockResolvedValue({ id: "post-1" });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns the admin post list with ISO creation dates", async () => {
		mocks.findPostsAdmin.mockResolvedValue([
			{ createdAt: new Date("2026-07-16T10:00:00.000Z"), id: "post-1", status: PublishStatus.DRAFT, title: "Tulisan Baru" },
		]);

		await expect(getPostsAdmin()).resolves.toEqual([
			{ createdAt: "2026-07-16T10:00:00.000Z", id: "post-1", status: PublishStatus.DRAFT, title: "Tulisan Baru" },
		]);
	});

	it("calculates reading time from content word count", () => {
		expect(calculateReadingTime("")).toBe(1);
		expect(calculateReadingTime(Array.from({ length: 201 }, () => "kata").join(" "))).toBe(2);
	});

	it("creates a unique slug, reading time, and publication timestamp", async () => {
		await expect(createAdminPost(input)).resolves.toEqual({ id: "post-1", slug: "tulisan-baru" });
		expect(mocks.isPostSlugAvailable).toHaveBeenCalledWith("tulisan-baru");
		expect(mocks.createPostRecord).toHaveBeenCalledWith({
			...input,
			publishedAt: new Date("2026-07-17T10:00:00.000Z"),
			readingTime: 1,
			slug: "tulisan-baru",
		});
	});

	it("preserves slug and first publication date while recalculating reading time", async () => {
		const firstPublishedAt = new Date("2025-01-01T00:00:00.000Z");
		mocks.findPostForAdmin.mockResolvedValue({
			publishedAt: firstPublishedAt,
			slug: "tulisan-baru",
			title: "Tulisan Baru",
		});

		await updateAdminPost("post-1", {
			...input,
			content: Array.from({ length: 201 }, () => "kata").join(" "),
			status: PublishStatus.ARCHIVED,
		});
		expect(mocks.isPostSlugAvailable).not.toHaveBeenCalled();
		expect(mocks.updatePostRecord).toHaveBeenCalledWith(
			"post-1",
			expect.objectContaining({ publishedAt: firstPublishedAt, readingTime: 2, slug: "tulisan-baru" }),
		);
	});

	it("regenerates a slug and publishes only the first time", async () => {
		mocks.findPostForAdmin.mockResolvedValue({
			publishedAt: null,
			slug: "tulisan-lama",
			title: "Tulisan Lama",
		});

		await updateAdminPost("post-1", input);
		expect(mocks.isPostSlugAvailable).toHaveBeenCalledWith("tulisan-baru", "post-1");
		expect(mocks.updatePostRecord).toHaveBeenCalledWith(
			"post-1",
			expect.objectContaining({
				publishedAt: new Date("2026-07-17T10:00:00.000Z"),
				slug: "tulisan-baru",
			}),
		);
	});

	it("does not mutate a missing post", async () => {
		mocks.findPostForAdmin.mockResolvedValue(null);

		await expect(updateAdminPost("missing", input)).resolves.toBeNull();
		await expect(deleteAdminPost("missing")).resolves.toBeNull();
		expect(mocks.updatePostRecord).not.toHaveBeenCalled();
		expect(mocks.deletePostRecord).not.toHaveBeenCalled();
	});
});
