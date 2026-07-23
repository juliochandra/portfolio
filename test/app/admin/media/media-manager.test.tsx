import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createMediaFolder: vi.fn(),
	deleteMedia: vi.fn(),
	refresh: vi.fn(),
	uploadMedia: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/features/media/media.action", () => ({
	createMediaFolder: mocks.createMediaFolder,
	deleteMedia: mocks.deleteMedia,
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
	});

	it("shows the empty gallery state", () => {
		const manager = render(<MediaManager folders={[]} media={[]} />);

		expect(manager.getByText("Belum ada gambar. Unggah yang pertama.")).toBeInTheDocument();
	});

	it("uploads the selected file with FormData and refreshes the gallery", async () => {
		const manager = render(<MediaManager folders={[]} media={[]} />);
		const file = new File(["image"], "image.png", { type: "image/png" });

		fireEvent.change(manager.getByLabelText("Pilih gambar untuk diunggah"), { target: { files: [file] } });

		await waitFor(() => expect(mocks.uploadMedia).toHaveBeenCalledOnce());
		const formData = mocks.uploadMedia.mock.calls[0][0] as FormData;
		expect(formData.get("file")).toBe(file);
		expect(mocks.refresh).toHaveBeenCalledOnce();
	});

	it("shows file errors returned by the server action", async () => {
		mocks.uploadMedia.mockResolvedValue({ error: { fields: { file: "Jenis berkas harus JPG, PNG, atau WebP." } } });
		const manager = render(<MediaManager folders={[]} media={[]} />);
		const file = new File(["file"], "file.gif", { type: "image/gif" });

		fireEvent.change(manager.getByLabelText("Pilih gambar untuk diunggah"), { target: { files: [file] } });

		await waitFor(() => expect(manager.getByText("Jenis berkas harus JPG, PNG, atau WebP.")).toBeInTheDocument());
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
});
