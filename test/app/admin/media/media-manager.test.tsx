import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteMedia: vi.fn(),
	refresh: vi.fn(),
	uploadMedia: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/features/media/media.action", () => ({
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
	});

	it("shows the empty gallery state", () => {
		const manager = render(<MediaManager media={[]} />);

		expect(manager.getByText("Belum ada gambar. Unggah yang pertama.")).toBeInTheDocument();
	});

	it("uploads the selected file with FormData and refreshes the gallery", async () => {
		const manager = render(<MediaManager media={[]} />);
		const file = new File(["image"], "image.png", { type: "image/png" });

		fireEvent.change(manager.getByLabelText("Pilih gambar untuk diunggah"), { target: { files: [file] } });

		await waitFor(() => expect(mocks.uploadMedia).toHaveBeenCalledOnce());
		const formData = mocks.uploadMedia.mock.calls[0][0] as FormData;
		expect(formData.get("file")).toBe(file);
		expect(mocks.refresh).toHaveBeenCalledOnce();
	});

	it("shows file errors returned by the server action", async () => {
		mocks.uploadMedia.mockResolvedValue({ error: { fields: { file: "Jenis berkas harus JPG, PNG, atau WebP." } } });
		const manager = render(<MediaManager media={[]} />);
		const file = new File(["file"], "file.gif", { type: "image/gif" });

		fireEvent.change(manager.getByLabelText("Pilih gambar untuk diunggah"), { target: { files: [file] } });

		await waitFor(() => expect(manager.getByText("Jenis berkas harus JPG, PNG, atau WebP.")).toBeInTheDocument());
		expect(mocks.refresh).not.toHaveBeenCalled();
	});
});
