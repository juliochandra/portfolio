import { cleanup, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getPosts: vi.fn() }));

vi.mock("@/features/posts/posts.action", () => ({ getPosts: mocks.getPosts }));

import BlogPage from "@/app/(public)/blog/page";

const post = {
	description: "Ringkasan tulisan contoh.",
	id: "post-1",
	publishedAt: "2024-07-17T00:00:00.000Z",
	readingTime: 7,
	slug: "tulisan-contoh",
	tags: [{ name: "Next.js" }],
	thumbnailImage: null,
	title: "Tulisan Contoh",
};

describe("Blog page", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.getPosts.mockResolvedValue({ data: [post] });
	});

	it("renders every published post and live blog statistics", async () => {
		const blogPage = render(await BlogPage());

		expect(blogPage.getByRole("heading", { level: 1, name: "Blog" })).toBeInTheDocument();
		expect(blogPage.getByRole("heading", { name: "Semua Tulisan" })).toBeInTheDocument();
		expect(blogPage.getByText(post.title)).toBeInTheDocument();
		expect(blogPage.getByText("1+")).toBeInTheDocument();
		expect(blogPage.getByText("7+")).toBeInTheDocument();
		expect(blogPage.getByText(/2024.*Sekarang/)).toBeInTheDocument();
		expect(mocks.getPosts).toHaveBeenCalledOnce();
		expect(mocks.getPosts).toHaveBeenCalledWith();
	});

	it("keeps the hero visible when there are no published posts", async () => {
		mocks.getPosts.mockResolvedValue({ data: [] });

		const blogPage = render(await BlogPage());

		expect(blogPage.getByRole("heading", { level: 1, name: "Blog" })).toBeInTheDocument();
		expect(blogPage.getAllByText("0+")).toHaveLength(2);
		expect(blogPage.getByText("Belum ada tulisan.")).toBeInTheDocument();
	});
});
