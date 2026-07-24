/** biome-ignore-all lint/nursery/noSecrets: Fixture post content is not sensitive. */
import { cleanup, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getPostBySlug: vi.fn(),
	notFound: vi.fn(),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/features/posts/posts.action", () => ({ getPostBySlug: mocks.getPostBySlug }));

import PostDetailPage from "@/app/(public)/blog/[slug]/page";

const post = {
	content: "## Catatan\n\nIsi lengkap tulisan contoh.",
	description: "Ringkasan tulisan contoh.",
	id: "post-1",
	nextPost: { slug: "tulisan-lama", title: "Tulisan Lama" },
	publishedAt: "2026-07-20T00:00:00.000Z",
	prevPost: { slug: "tulisan-baru", title: "Tulisan Baru" },
	readingTime: 7,
	slug: "tulisan-contoh",
	tags: [{ name: "Next.js" }],
	thumbnailImage: "https://example.com/cover.png",
	title: "Tulisan Contoh",
};

describe("Post detail page", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.getPostBySlug.mockResolvedValue({ data: post });
	});

	it("renders the post content, share actions, and adjacent posts", async () => {
		const postPage = render(await PostDetailPage({ params: Promise.resolve({ slug: post.slug }) }));

		expect(postPage.getByRole("heading", { level: 1, name: post.title })).toHaveClass("w-full");
		expect(postPage.getByText(post.description)).toHaveClass("w-full");
		expect(postPage.getByText(/20 Juli 2026/)).toBeInTheDocument();
		expect(postPage.getByText(/Isi lengkap tulisan contoh/)).toHaveClass("w-full", "[&_h4]:text-xl", "[&_h5]:text-lg");
		expect(postPage.getByAltText(`Gambar sampul ${post.title}`)).toHaveClass("max-w-full");
		expect(postPage.getByAltText(`Gambar sampul ${post.title}`)).not.toHaveClass("w-full", "aspect-video");
		expect(postPage.getByLabelText(`Tag untuk ${post.title}`)).toHaveTextContent("Next.js");
		expect(postPage.getByRole("link", { name: /Tulisan Sebelumnya/ })).toHaveAttribute("href", "/blog/tulisan-baru");
		expect(postPage.getByRole("link", { name: /Tulisan Selanjutnya/ })).toHaveAttribute("href", "/blog/tulisan-lama");
		expect(postPage.getByRole("button", { name: "Twitter" })).toBeInTheDocument();
		expect(postPage.getByRole("button", { name: "LinkedIn" })).toBeInTheDocument();
		expect(postPage.getByRole("button", { name: "Salin tautan" })).toBeInTheDocument();
	});

	it("hides each unavailable adjacent post cell", async () => {
		mocks.getPostBySlug.mockResolvedValue({ data: { ...post, nextPost: null, prevPost: null } });

		const postPage = render(await PostDetailPage({ params: Promise.resolve({ slug: post.slug }) }));

		expect(postPage.queryByRole("navigation", { name: "Navigasi tulisan" })).not.toBeInTheDocument();
	});

	it("uses Next.js notFound when the post is unavailable", async () => {
		mocks.getPostBySlug.mockResolvedValue({ error: { message: "Tulisan tidak ditemukan." } });
		mocks.notFound.mockImplementation(() => {
			throw new Error("not found");
		});

		await expect(PostDetailPage({ params: Promise.resolve({ slug: "missing-post" }) })).rejects.toThrow("not found");
		expect(mocks.notFound).toHaveBeenCalledOnce();
	});
});
