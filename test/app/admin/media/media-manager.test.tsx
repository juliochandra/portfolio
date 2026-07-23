import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createMediaFolder: vi.fn(),
	deleteMedia: vi.fn(),
	deleteMediaFolder: vi.fn(),
	refresh: vi.fn(),
	uploadMedia: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/features/media/media.action", () => ({
	createMediaFolder: mocks.createMediaFolder,
	deleteMedia: mocks.deleteMedia,
	deleteMediaFolder: mocks.deleteMediaFolder,
	uploadMedia: mocks.uploadMedia,
}));

import { MediaManager } from "@/app/admin/media/_components/MediaManager";

// biome-ignore lint/nursery/noSecrets: Component name, not a secret.
describe("MediaManager", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.uploadMedia.mockResolvedValue({ data: { id: "media-1", url: "https://cdn.example/image.png" } });
		mocks.createMediaFolder.mockResolvedValue({ data: { id: "folder-1", name: "Portfolio" } });
		mocks.deleteMediaFolder.mockResolvedValue({ data: { id: "folder-1" } });
	});

	it("shows the empty gallery state", () => {
		const manager = render(<MediaManager folders={[]} media={[]} />);

		expect(manager.getByText("Belum ada gambar. Unggah yang pertama.")).toBeInTheDocument();
	});

	it("uploads selected files with FormData and refreshes the gallery", async () => {
		const manager = render(<MediaManager folders={[]} media={[]} />);
		const firstFile = new File(["image"], "first.png", { type: "image/png" });
		const secondFile = new File(["image"], "second.png", { type: "image/png" });

		fireEvent.change(manager.getByLabelText("Pilih gambar untuk diunggah"), {
			target: { files: [firstFile, secondFile] },
		});

		await waitFor(() => expect(mocks.uploadMedia).toHaveBeenCalledTimes(2));
		const firstFormData = mocks.uploadMedia.mock.calls[0][0] as FormData;
		const secondFormData = mocks.uploadMedia.mock.calls[1][0] as FormData;
		expect(firstFormData.get("file")).toBe(firstFile);
		expect(secondFormData.get("file")).toBe(secondFile);
		expect(manager.getByText("2 gambar berhasil diunggah.")).toBeInTheDocument();
		expect(mocks.refresh).toHaveBeenCalledOnce();
	});

	it("shows file errors returned by the server action", async () => {
		mocks.uploadMedia.mockResolvedValue({ error: { fields: { file: "Jenis berkas harus JPG, PNG, atau WebP." } } });
		const manager = render(<MediaManager folders={[]} media={[]} />);
		const file = new File(["file"], "file.gif", { type: "image/gif" });

		fireEvent.change(manager.getByLabelText("Pilih gambar untuk diunggah"), { target: { files: [file] } });

		await waitFor(() => expect(manager.getByText("file.gif: Jenis berkas harus JPG, PNG, atau WebP.")).toBeInTheDocument());
		expect(mocks.refresh).not.toHaveBeenCalled();
	});

	it("creates a folder from the gallery root", async () => {
		const manager = render(
			<MediaManager
				folders={[{ id: "folder-1", name: "Portfolio" }]}
				media={[
					{
						createdAt: "2026-07-23T00:00:00.000Z",
						fileName: "portfolio.png",
						folderId: "folder-1",
						id: "media-1",
						mimeType: "image/png",
						size: 1024,
						url: "https://cdn.example/portfolio.png",
					},
				]}
			/>,
		);

		fireEvent.click(manager.getByRole("button", { name: "+ Buat Folder" }));
		fireEvent.change(manager.getByRole("textbox", { name: "Nama folder" }), { target: { value: "Blog" } });
		fireEvent.submit(manager.getByRole("button", { name: "Buat Folder" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(mocks.createMediaFolder).toHaveBeenCalledWith({ name: "Blog" }));
		expect(manager.getByRole("button", { name: "Portfolio" })).toBeInTheDocument();
	});

	it("sorts folders alphabetically", () => {
		const manager = render(
			<MediaManager
				folders={[
					{ id: "folder-1", name: "Zulu" },
					{ id: "folder-2", name: "alpha" },
				]}
				media={[]}
			/>,
		);

		expect(manager.getAllByRole("button", { name: /^(alpha|Zulu)$/ }).map((button) => button.textContent)).toEqual([
			"alpha",
			"Zulu",
		]);
	});

	it("sorts uploaded images alphabetically", () => {
		const manager = render(
			<MediaManager
				folders={[]}
				media={[
					{
						createdAt: "2026-07-23T00:00:00.000Z",
						fileName: "zulu.png",
						folderId: null,
						id: "media-1",
						mimeType: "image/png",
						size: 1024,
						url: "https://cdn.example/zulu.png",
					},
					{
						createdAt: "2026-07-23T00:00:00.000Z",
						fileName: "alpha.png",
						folderId: null,
						id: "media-2",
						mimeType: "image/png",
						size: 1024,
						url: "https://cdn.example/alpha.png",
					},
				]}
			/>,
		);

		expect(manager.getAllByRole("img").map((image) => image.getAttribute("alt"))).toEqual(["alpha.png", "zulu.png"]);
	});

	it("opens a folder and uploads images to it", async () => {
		const manager = render(<MediaManager folders={[{ id: "folder-1", name: "Portfolio" }]} media={[]} />);
		const file = new File(["image"], "portfolio.png", { type: "image/png" });

		fireEvent.click(manager.getByRole("button", { name: "Portfolio" }));
		fireEvent.change(manager.getByLabelText("Pilih gambar untuk diunggah"), { target: { files: [file] } });

		await waitFor(() => expect(mocks.uploadMedia).toHaveBeenCalledOnce());
		const formData = mocks.uploadMedia.mock.calls[0][0] as FormData;
		expect(formData.get("folderId")).toBe("folder-1");
		expect(manager.getByText("Folder Portfolio belum memiliki gambar.")).toBeInTheDocument();
	});

	it("allows deleting only empty folders", async () => {
		const manager = render(
			<MediaManager
				folders={[
					{ id: "empty-folder", name: "Kosong" },
					{ id: "used-folder", name: "Terisi" },
				]}
				media={[
					{
						createdAt: "2026-07-23T00:00:00.000Z",
						fileName: "image.png",
						folderId: "used-folder",
						id: "media-1",
						mimeType: "image/png",
						size: 1024,
						url: "https://cdn.example/image.png",
					},
				]}
			/>,
		);

		expect(manager.getByRole("button", { name: "Hapus folder Kosong" })).toBeInTheDocument();
		expect(manager.queryByRole("button", { name: "Hapus folder Terisi" })).not.toBeInTheDocument();

		fireEvent.click(manager.getByRole("button", { name: "Hapus folder Kosong" }));
		fireEvent.click(within(manager.getByRole("dialog")).getByRole("button", { name: "Hapus" }));

		await waitFor(() => expect(mocks.deleteMediaFolder).toHaveBeenCalledWith("empty-folder"));
		expect(mocks.refresh).toHaveBeenCalledOnce();
	});
});
