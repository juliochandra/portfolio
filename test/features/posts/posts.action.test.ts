import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException, ValidationException } from "@/lib/server-action-exception/exceptions";
import type { RichTextDocument } from "@/lib/tiptap/json";

const mocks = vi.hoisted(() => ({
	getPublishedPostBySlug: vi.fn(),
	getPublishedPosts: vi.fn(),
}));

vi.mock("@/features/posts/posts.services", () => ({
	getPublishedPostBySlug: mocks.getPublishedPostBySlug,
	getPublishedPosts: mocks.getPublishedPosts,
}));

import { getPostBySlug, getPosts } from "@/features/posts/posts.action";

const content: RichTextDocument = {
	content: [{ content: [{ text: "Isi lengkap tulisan.", type: "text" }], type: "paragraph" }],
	type: "doc",
};

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

describe("post public Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getPublishedPosts.mockResolvedValue([postListItem]);
		mocks.getPublishedPostBySlug.mockResolvedValue({ ...postListItem, content, nextPost: null, prevPost: null });
	});

	it("forwards post list parameters to the service", async () => {
		await expect(getPosts({ limit: 3 })).resolves.toEqual({ data: [postListItem] });
		expect(mocks.getPublishedPosts).toHaveBeenCalledWith({ limit: 3 });
	});

	it("maps validation errors from the service", async () => {
		mocks.getPublishedPosts.mockRejectedValue(
			new ValidationException({ limit: "Number must be greater than 0" }, "Parameter tulisan tidak valid."),
		);

		await expect(getPosts({ limit: 0 })).resolves.toEqual({
			error: {
				code: "VALIDATION_ERROR",
				fields: { limit: "Number must be greater than 0" },
				message: "Parameter tulisan tidak valid.",
			},
		});
	});

	it("returns a published post from the service", async () => {
		await expect(getPostBySlug("memahami-server-actions")).resolves.toMatchObject({
			data: { id: "post-1", title: "Memahami Server Actions" },
		});
	});

	it("maps unavailable posts to a not-found error", async () => {
		mocks.getPublishedPostBySlug.mockRejectedValue(new NotFoundException("Tulisan tidak ditemukan."));

		await expect(getPostBySlug("draft-post")).resolves.toEqual({
			error: { code: "NOT_FOUND", message: "Tulisan tidak ditemukan." },
		});
	});
});
