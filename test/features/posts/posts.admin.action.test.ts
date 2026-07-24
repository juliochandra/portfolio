import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/shared/publish-status";

const mocks = vi.hoisted(() => ({
	createAdminPost: vi.fn(),
	deleteAdminPost: vi.fn(),
	getPostAdminById: vi.fn(),
	getPostsAdmin: vi.fn(),
	getPostsAdminPage: vi.fn(),
	getServerSession: vi.fn(),
	updateAdminPost: vi.fn(),
}));

vi.mock("@/shared/auth/server-session", () => ({
	getServerSession: mocks.getServerSession,
}));
vi.mock("@/features/posts/posts.services", () => ({
	createAdminPost: mocks.createAdminPost,
	deleteAdminPost: mocks.deleteAdminPost,
	getPostAdminById: mocks.getPostAdminById,
	getPostsAdmin: mocks.getPostsAdmin,
	getPostsAdminPage: mocks.getPostsAdminPage,
	getPublishedPostBySlug: vi.fn(),
	getPublishedPosts: vi.fn(),
	updateAdminPost: mocks.updateAdminPost,
}));

import {
	createPost,
	deletePost,
	getPostAdmin,
	getPostsAdmin,
	getPostsAdminPage,
	updatePost,
} from "@/features/posts/posts.action";

function postInput(values: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		content: "Isi tulisan",
		status: PublishStatus.DRAFT,
		title: "Tulisan Baru",
		...values,
	};
}

describe("post admin Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getPostsAdmin.mockResolvedValue([]);
		mocks.getPostsAdminPage.mockResolvedValue({ currentPage: 1, posts: [], totalPages: 1 });
		mocks.getPostAdminById.mockResolvedValue({
			content: "Isi tulisan",
			description: null,
			id: "post-1",
			status: PublishStatus.DRAFT,
			tagIds: ["tag-1"],
			thumbnailImage: null,
			title: "Tulisan Baru",
		});
		mocks.createAdminPost.mockResolvedValue({ id: "post-1", slug: "tulisan-baru" });
		mocks.updateAdminPost.mockResolvedValue({ id: "post-1", slug: "tulisan-baru" });
		mocks.deleteAdminPost.mockResolvedValue({ id: "post-1" });
	});

	it("checks a session before every admin action", async () => {
		mocks.getServerSession.mockResolvedValue(null);

		await expect(getPostsAdmin()).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(getPostAdmin("post-1")).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(createPost(postInput())).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(updatePost("post-1", postInput())).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(deletePost("post-1")).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		expect(mocks.createAdminPost).not.toHaveBeenCalled();
	});

	it("lists all posts for an authenticated admin", async () => {
		mocks.getPostsAdmin.mockResolvedValue([
			{ createdAt: "2026-07-17T10:00:00.000Z", id: "post-1", status: PublishStatus.ARCHIVED, title: "Tulisan Lama" },
		]);

		await expect(getPostsAdmin()).resolves.toEqual({
			data: [{ createdAt: "2026-07-17T10:00:00.000Z", id: "post-1", status: "ARCHIVED", title: "Tulisan Lama" }],
		});
	});

	it("gets a validated page of posts for an authenticated admin", async () => {
		mocks.getPostsAdminPage.mockResolvedValue({ currentPage: 2, posts: [], totalPages: 2 });

		await expect(getPostsAdminPage(2)).resolves.toEqual({
			data: { currentPage: 2, posts: [], totalPages: 2 },
		});
		expect(mocks.getPostsAdminPage).toHaveBeenCalledWith(2);
	});

	it("gets a post detail for an authenticated admin", async () => {
		await expect(getPostAdmin("post-1")).resolves.toMatchObject({
			data: { id: "post-1", tagIds: ["tag-1"], title: "Tulisan Baru" },
		});
		expect(mocks.getPostAdminById).toHaveBeenCalledWith("post-1");
	});

	it("validates an object input and creates a draft by default", async () => {
		await expect(createPost({ content: "Isi tulisan", title: "Tulisan Baru" })).resolves.toEqual({
			data: { id: "post-1", slug: "tulisan-baru" },
		});
		expect(mocks.createAdminPost).toHaveBeenCalledWith({
			content: "Isi tulisan",
			description: null,
			status: PublishStatus.DRAFT,
			tagIds: [],
			thumbnailImage: null,
			title: "Tulisan Baru",
		});
	});

	it("returns field errors without creating an invalid post", async () => {
		const result = await createPost(postInput({ content: "", title: "" }));

		expect(result).toEqual({
			error: { fields: { content: "Wajib diisi.", title: "Wajib diisi." } },
		});
		expect(mocks.createAdminPost).not.toHaveBeenCalled();
	});

	it("rejects an invalid thumbnail URL before creating a post", async () => {
		const result = await createPost(postInput({ thumbnailImage: "not-a-url" }));

		expect(result).toEqual({ error: { fields: { thumbnailImage: "URL tidak valid." } } });
		expect(mocks.createAdminPost).not.toHaveBeenCalled();
	});

	it("updates and deletes posts for an authenticated admin", async () => {
		await expect(updatePost("post-1", postInput({ status: PublishStatus.PUBLISHED }))).resolves.toEqual({
			data: { id: "post-1", slug: "tulisan-baru" },
		});
		expect(mocks.updateAdminPost).toHaveBeenCalledWith(
			"post-1",
			expect.objectContaining({ status: PublishStatus.PUBLISHED }),
		);

		await expect(deletePost("post-1")).resolves.toEqual({ data: { id: "post-1" } });
	});

	it("maps unavailable posts to the action contracts", async () => {
		mocks.updateAdminPost.mockResolvedValue(null);
		mocks.deleteAdminPost.mockResolvedValue(null);

		await expect(updatePost("missing", postInput())).resolves.toEqual({
			error: { fields: { _form: "Tulisan tidak ditemukan." } },
		});
		await expect(deletePost("missing")).resolves.toEqual({ error: { message: "Tulisan tidak ditemukan." } });
	});
});
