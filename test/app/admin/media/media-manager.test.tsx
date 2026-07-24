import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createMediaFolder: vi.fn(),
	deleteMedia: vi.fn(),
	deleteMediaFolder: vi.fn(),
	getMediaGalleryPage: vi.fn(),
	refresh: vi.fn(),
	uploadMedia: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/features/media/media.action", () => ({
	createMediaFolder: mocks.createMediaFolder,
	deleteMedia: mocks.deleteMedia,
	deleteMediaFolder: mocks.deleteMediaFolder,
	getMediaGalleryPage: mocks.getMediaGalleryPage,
	uploadMedia: mocks.uploadMedia,
}));

import { MediaManager } from "@/app/admin/media/_components/MediaManager";

const emptyGallery = { currentPage: 1, media: [], totalPages: 1 };

// biome-ignore lint/nursery/noSecrets: Component name, not a secret.
describe("MediaManager", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.createMediaFolder.mockResolvedValue({ data: { id: "folder-1", name: "Portfolio" } });
		mocks.deleteMediaFolder.mockResolvedValue({ data: { id: "folder-1" } });
		mocks.getMediaGalleryPage.mockResolvedValue({ data: emptyGallery });
		mocks.uploadMedia.mockResolvedValue({ data: { id: "media-1", url: "https://cdn.example/image.png" } });
	});

	it("shows the empty gallery state", () => {
		const manager = render(<MediaManager folders={[]} gallery={emptyGallery} />);

		expect(manager.getByText("Belum ada gambar. Unggah yang pertama.")).toBeInTheDocument();
	});

	it("uploads selected files and reloads the current gallery", async () => {
		const manager = render(<MediaManager folders={[]} gallery={emptyGallery} />);
		const firstFile = new File(["image"], "first.png", { type: "image/png" });
		const secondFile = new File(["image"], "second.png", { type: "image/png" });

		fireEvent.change(manager.getByLabelText("Pilih gambar untuk diunggah"), {
			target: { files: [firstFile, secondFile] },
		});

		await waitFor(() => expect(mocks.uploadMedia).toHaveBeenCalledTimes(2));
		expect((mocks.uploadMedia.mock.calls[0][0] as FormData).get("file")).toBe(firstFile);
		expect((mocks.uploadMedia.mock.calls[1][0] as FormData).get("file")).toBe(secondFile);
		await waitFor(() => expect(mocks.getMediaGalleryPage).toHaveBeenCalledWith({ folderId: null, page: 1 }));
		expect(mocks.refresh).toHaveBeenCalledOnce();
	});

	it("loads the selected page of the gallery", async () => {
		mocks.getMediaGalleryPage.mockResolvedValue({
			data: {
				currentPage: 2,
				media: [
					{
						createdAt: "2026-07-23T00:00:00.000Z",
						fileName: "page-two.png",
						folderId: null,
						id: "media-2",
						mimeType: "image/png",
						size: 1024,
						url: "https://cdn.example/page-two.png",
					},
				],
				totalPages: 2,
			},
		});
		const manager = render(<MediaManager folders={[]} gallery={{ ...emptyGallery, totalPages: 2 }} />);

		fireEvent.click(manager.getByRole("button", { name: "Berikutnya" }));

		await waitFor(() => expect(mocks.getMediaGalleryPage).toHaveBeenCalledWith({ folderId: null, page: 2 }));
		expect(manager.getByRole("img", { name: "page-two.png" })).toBeInTheDocument();
	});

	it("opens a folder and loads its first page", async () => {
		const manager = render(
			<MediaManager folders={[{ id: "folder-1", mediaCount: 1, name: "Portfolio" }]} gallery={emptyGallery} />,
		);

		fireEvent.click(manager.getByRole("button", { name: "Portfolio" }));

		await waitFor(() => expect(mocks.getMediaGalleryPage).toHaveBeenCalledWith({ folderId: "folder-1", page: 1 }));
		expect(manager.getByText("Folder Portfolio belum memiliki gambar.")).toBeInTheDocument();
	});

	it("creates folders and only offers deletion for empty folders", async () => {
		const manager = render(
			<MediaManager
				folders={[
					{ id: "empty-folder", mediaCount: 0, name: "Kosong" },
					{ id: "used-folder", mediaCount: 1, name: "Terisi" },
				]}
				gallery={emptyGallery}
			/>,
		);

		fireEvent.click(manager.getByRole("button", { name: "+ Buat Folder" }));
		fireEvent.change(manager.getByRole("textbox", { name: "Nama folder" }), { target: { value: "Blog" } });
		fireEvent.submit(manager.getByRole("button", { name: "Buat Folder" }).closest("form") as HTMLFormElement);
		await waitFor(() => expect(mocks.createMediaFolder).toHaveBeenCalledWith({ name: "Blog" }));

		expect(manager.getByRole("button", { name: "Hapus folder Kosong" })).toBeInTheDocument();
		expect(manager.queryByRole("button", { name: "Hapus folder Terisi" })).not.toBeInTheDocument();
		fireEvent.click(manager.getByRole("button", { name: "Hapus folder Kosong" }));
		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Hapus" }));
		await waitFor(() => expect(mocks.deleteMediaFolder).toHaveBeenCalledWith("empty-folder"));
	});
});
