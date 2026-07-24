import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createPost: vi.fn(),
	push: vi.fn(),
	refresh: vi.fn(),
	replace: vi.fn(),
	updatePost: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh, replace: mocks.replace }) }));
vi.mock("@/features/posts/posts.action", () => ({
	createPost: mocks.createPost,
	updatePost: mocks.updatePost,
}));
// biome-ignore lint/nursery/noSecrets: Module path, not a secret.
vi.mock("@/shared/components/RichTextEditor", () => ({
	RichTextEditor: ({ initialContent, label, name }: { initialContent: string; label: string; name: string }) => (
		<textarea name={name} aria-label={label} defaultValue={initialContent} />
	),
}));

import { PostForm } from "@/app/admin/posts/_components/PostForm";

describe("PostForm", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.createPost.mockResolvedValue({ data: { id: "post-1", slug: "tulisan-baru" } });
		mocks.updatePost.mockResolvedValue({ data: { id: "post-1", slug: "tulisan-baru" } });
	});

	it("shows validation errors without creating an incomplete post", async () => {
		const postForm = render(<PostForm folders={[]} media={[]} tags={[]} />);

		fireEvent.submit(postForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(postForm.getAllByText("Wajib diisi.")).toHaveLength(2);
		});
		expect(mocks.createPost).not.toHaveBeenCalled();
	});

	it("labels the optional excerpt field as description", () => {
		const postForm = render(<PostForm folders={[]} media={[]} tags={[]} />);

		expect(postForm.container.querySelector("section")).toHaveClass("w-full");
		expect(postForm.getByRole("textbox", { name: "Deskripsi" })).toBeInTheDocument();
	});

	it("selects multiple tags using badges", async () => {
		const postForm = render(
			<PostForm
				folders={[]}
				media={[]}
				tags={[
					{ id: "tag-1", name: "Zod" },
					{ id: "tag-2", name: "TypeScript" },
				]}
			/>,
		);
		fireEvent.change(postForm.getByRole("textbox", { name: "Judul" }), { target: { value: "Tulisan Baru" } });
		fireEvent.change(postForm.getByRole("textbox", { name: "Isi" }), { target: { value: "Isi tulisan" } });
		fireEvent.click(postForm.getByRole("button", { name: "zod" }));
		fireEvent.click(postForm.getByRole("button", { name: "typescript" }));

		expect(postForm.getByRole("button", { name: "zod" })).toHaveAttribute("aria-pressed", "true");
		expect(postForm.getByRole("button", { name: "typescript" })).toHaveAttribute("aria-pressed", "true");
		expect(postForm.getByRole("group", { name: "Tag" })).toHaveTextContent("typescriptzod");

		fireEvent.submit(postForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(mocks.createPost).toHaveBeenCalledWith(expect.objectContaining({ tagIds: ["tag-1", "tag-2"] }));
		});
	});

	it("selects a cover image from the media modal", () => {
		const postForm = render(
			<PostForm
				folders={[{ id: "folder-1", name: "Portfolio" }]}
				media={[
					{ fileName: "cover.png", folderId: "folder-1", id: "media-1", url: "https://cdn.example/cover.png" },
					{ fileName: "root.png", folderId: null, id: "media-2", url: "https://cdn.example/root.png" },
				]}
				tags={[]}
			/>,
		);
		fireEvent.click(postForm.getByRole("button", { name: "Pilih gambar sampul" }));

		expect(postForm.getByRole("dialog", { name: "Pilih Gambar Sampul" })).toBeInTheDocument();
		expect(postForm.getByRole("button", { name: "Portfolio" })).toBeInTheDocument();
		expect(postForm.getByRole("button", { name: "Pilih root.png" })).toBeInTheDocument();
		fireEvent.click(postForm.getByRole("button", { name: "Portfolio" }));
		expect(postForm.getByRole("button", { name: "Pilih cover.png" })).toBeInTheDocument();
		expect(postForm.getByText("cover.png")).toBeInTheDocument();
		expect(postForm.queryByRole("button", { name: "Pilih root.png" })).not.toBeInTheDocument();
		fireEvent.click(postForm.getByRole("button", { name: "Pilih cover.png" }));

		expect(postForm.queryByRole("dialog", { name: "Pilih Gambar Sampul" })).not.toBeInTheDocument();
		expect(postForm.getByAltText("Pratinjau gambar sampul")).toHaveAttribute("src", "https://cdn.example/cover.png");
		fireEvent.click(postForm.getByRole("button", { name: "Pilih gambar sampul" }));
		fireEvent.click(postForm.getByRole("button", { name: "Tanpa gambar" }));
		expect(postForm.queryByAltText("Pratinjau gambar sampul")).not.toBeInTheDocument();
		expect(postForm.getByText("Belum ada gambar sampul")).toBeInTheDocument();
	});

	it("creates a post and opens its edit page after a successful save", async () => {
		const postForm = render(<PostForm folders={[]} media={[]} tags={[]} />);
		fireEvent.change(postForm.getByRole("textbox", { name: "Judul" }), { target: { value: "Tulisan Baru" } });
		fireEvent.change(postForm.getByRole("textbox", { name: "Isi" }), { target: { value: "Isi tulisan" } });

		fireEvent.submit(postForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(mocks.createPost).toHaveBeenCalledOnce();
		});
		expect(mocks.replace).toHaveBeenCalledWith("/admin/posts/post-1");
	});

	it("stays on the edit page after a successful update", async () => {
		const postForm = render(
			<PostForm
				folders={[]}
				media={[]}
				post={{
					content: "Isi tulisan",
					description: null,
					id: "post-1",
					status: "DRAFT",
					tagIds: [],
					thumbnailImage: null,
					title: "Tulisan Lama",
				}}
				tags={[]}
			/>,
		);

		fireEvent.submit(postForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(mocks.updatePost).toHaveBeenCalledOnce());
		expect(postForm.getByText("Tulisan tersimpan.")).toBeInTheDocument();
		expect(mocks.refresh).toHaveBeenCalledOnce();
		expect(mocks.replace).not.toHaveBeenCalled();
	});
});
