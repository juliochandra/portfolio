import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getMediaGalleryPage: vi.fn() }));

vi.mock("@/features/media/media.action", () => ({ getMediaGalleryPage: mocks.getMediaGalleryPage }));

import { MediaImagePickerModal } from "@/components/media/MediaImagePickerModal";

// biome-ignore lint/nursery/noSecrets: Component name, not a secret.
describe("MediaImagePickerModal", () => {
	it("loads the selected page without closing the modal", async () => {
		mocks.getMediaGalleryPage.mockResolvedValue({
			data: {
				currentPage: 2,
				media: [{ fileName: "page-two.png", folderId: null, id: "media-2", url: "https://cdn.example/page-two.png" }],
				totalPages: 2,
			},
		});
		render(
			<MediaImagePickerModal
				currentPage={1}
				folders={[]}
				media={[{ fileName: "page-one.png", folderId: null, id: "media-1", url: "https://cdn.example/page-one.png" }]}
				onClose={vi.fn()}
				onSelect={vi.fn()}
				title="Pilih Gambar"
				totalPages={2}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Berikutnya" }));

		await waitFor(() => expect(mocks.getMediaGalleryPage).toHaveBeenCalledWith({ folderId: null, page: 2 }));
		expect(screen.getByRole("dialog", { name: "Pilih Gambar" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Pilih page-two.png" })).toBeInTheDocument();
	});
});
