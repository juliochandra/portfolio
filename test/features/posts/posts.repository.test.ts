import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/lib/publish-status";

const mocks = vi.hoisted(() => ({
	findFirst: vi.fn(),
	findMany: vi.fn(),
}));

vi.mock("@/lib/database/prisma", () => ({
	prisma: {
		post: {
			findFirst: mocks.findFirst,
			findMany: mocks.findMany,
		},
	},
}));

import { findNextPublishedPost, findPostBySlug, findPosts, findPreviousPublishedPost } from "@/features/posts/posts.repository";

describe("post repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
		mocks.findFirst.mockResolvedValue(null);
	});

	it("filters, orders, and limits post list queries", async () => {
		await findPosts({ limit: 3, status: PublishStatus.PUBLISHED });

		expect(mocks.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				orderBy: { publishedAt: "desc" },
				select: expect.objectContaining({ readingTime: true, tags: { select: { name: true } } }),
				take: 3,
				where: { status: PublishStatus.PUBLISHED },
			}),
		);
	});

	it("queries post detail by slug and status together", async () => {
		await findPostBySlug({
			slug: "memahami-server-actions",
			status: PublishStatus.PUBLISHED,
		});

		expect(mocks.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					slug: "memahami-server-actions",
					status: PublishStatus.PUBLISHED,
				},
			}),
		);
	});

	it("queries adjacent published posts around a publication date", async () => {
		const publishedAt = new Date("2026-07-17T02:00:00.000Z");

		await findPreviousPublishedPost({ publishedAt });
		expect(mocks.findFirst).toHaveBeenLastCalledWith(
			expect.objectContaining({
				orderBy: { publishedAt: "asc" },
				where: { publishedAt: { gt: publishedAt }, status: PublishStatus.PUBLISHED },
			}),
		);

		await findNextPublishedPost({ publishedAt });
		expect(mocks.findFirst).toHaveBeenLastCalledWith(
			expect.objectContaining({
				orderBy: { publishedAt: "desc" },
				where: { publishedAt: { lt: publishedAt }, status: PublishStatus.PUBLISHED },
			}),
		);
	});
});
