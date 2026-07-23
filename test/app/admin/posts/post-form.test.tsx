import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createPost: vi.fn(),
	push: vi.fn(),
	refresh: vi.fn(),
	updatePost: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }) }));
vi.mock("@/features/posts/posts.action", () => ({
	createPost: mocks.createPost,
	updatePost: mocks.updatePost,
}));

import { PostForm } from "@/app/admin/posts/_components/PostForm";

describe("PostForm", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.createPost.mockResolvedValue({ data: { id: "post-1", slug: "tulisan-baru" } });
	});

	it("shows validation errors without creating an incomplete post", async () => {
		const postForm = render(<PostForm media={[]} tags={[]} />);

		fireEvent.submit(postForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(postForm.getAllByText("Wajib diisi.")).toHaveLength(2);
		});
		expect(mocks.createPost).not.toHaveBeenCalled();
	});

	it("creates a post and returns to the list after a successful save", async () => {
		const postForm = render(<PostForm media={[]} tags={[]} />);
		fireEvent.change(postForm.getByRole("textbox", { name: "Judul" }), { target: { value: "Tulisan Baru" } });
		fireEvent.change(postForm.getByRole("textbox", { name: "Isi" }), { target: { value: "Isi tulisan" } });

		fireEvent.submit(postForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(mocks.createPost).toHaveBeenCalledOnce();
		});
		expect(mocks.push).toHaveBeenCalledWith("/admin/posts?message=saved");
	});
});
