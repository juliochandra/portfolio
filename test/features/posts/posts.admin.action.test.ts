import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PostInput } from "@/features/posts/posts.type";
import { PublishStatus } from "@/lib/publish-status";
import { NotFoundException, UnauthorizedException, ValidationException } from "@/lib/server-action-exception/exceptions";

const serializedContent = JSON.stringify({
	content: [{ content: [{ text: "Isi tulisan", type: "text" }], type: "paragraph" }],
	type: "doc",
});

const mocks = vi.hoisted(() => ({
	createAdminPost: vi.fn(),
	deleteAdminPost: vi.fn(),
	getPostAdminById: vi.fn(),
	getPostsAdmin: vi.fn(),
	getPostsAdminPage: vi.fn(),
	requireServerSession: vi.fn(),
	updateAdminPost: vi.fn(),
}));

vi.mock("@/lib/auth/server-session", () => ({
	requireServerSession: mocks.requireServerSession,
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

function postInput(values: Partial<PostInput> = {}): PostInput {
	return {
		content: serializedContent,
		description: "",
		status: PublishStatus.DRAFT,
		tagIds: [],
		thumbnailImage: "",
		title: "Tulisan Baru",
		...values,
	};
}

describe("post admin Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.requireServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getPostsAdmin.mockResolvedValue([]);
		mocks.getPostsAdminPage.mockResolvedValue({ currentPage: 1, posts: [], totalPages: 1 });
		mocks.getPostAdminById.mockResolvedValue({
			content: serializedContent,
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
		mocks.requireServerSession.mockRejectedValue(new UnauthorizedException());

		await expect(getPostsAdmin()).resolves.toEqual({
			error: { code: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
		});
		await expect(createPost(postInput())).resolves.toEqual({
			error: { code: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
		});
		expect(mocks.createAdminPost).not.toHaveBeenCalled();
	});

	it("forwards authenticated admin requests to the services", async () => {
		await expect(getPostsAdminPage(2)).resolves.toEqual({ data: { currentPage: 1, posts: [], totalPages: 1 } });
		expect(mocks.getPostsAdminPage).toHaveBeenCalledWith(2);

		await expect(getPostAdmin("post-1")).resolves.toMatchObject({ data: { id: "post-1" } });
		await expect(createPost(postInput())).resolves.toEqual({ data: { id: "post-1", slug: "tulisan-baru" } });
		expect(mocks.createAdminPost).toHaveBeenCalledWith(postInput());

		await expect(updatePost("post-1", postInput())).resolves.toEqual({ data: { id: "post-1", slug: "tulisan-baru" } });
		expect(mocks.updateAdminPost).toHaveBeenCalledWith("post-1", postInput());

		await expect(deletePost("post-1")).resolves.toEqual({ data: { id: "post-1" } });
	});

	it("maps service validation and not-found errors", async () => {
		mocks.createAdminPost.mockRejectedValue(new ValidationException({ title: "Wajib diisi." }));
		await expect(createPost(postInput({ title: "" }))).resolves.toEqual({
			error: {
				code: "VALIDATION_ERROR",
				fields: { title: "Wajib diisi." },
				message: "Input tidak valid.",
			},
		});

		mocks.deleteAdminPost.mockRejectedValue(new NotFoundException("Tulisan tidak ditemukan."));
		await expect(deletePost("missing")).resolves.toEqual({
			error: { code: "NOT_FOUND", message: "Tulisan tidak ditemukan." },
		});
	});
});
