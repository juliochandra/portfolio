import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteMedia: vi.fn(),
}));

vi.mock("@/features/media/media.action", () => ({ deleteMedia: mocks.deleteMedia }));

import { MediaCard } from "@/components/admin/media/MediaCard";

describe("MediaCard", () => {
	it("requires confirmation before deleting an image", async () => {
		const onDeleted = vi.fn();
		mocks.deleteMedia.mockResolvedValue({ data: { id: "media-1" } });
		render(
			<MediaCard
				media={{
					createdAt: "2026-07-23T00:00:00.000Z",
					fileName: "image.png",
					folderId: null,
					id: "media-1",
					mimeType: "image/png",
					size: 1024,
					url: "https://cdn.example/image.png",
				}}
				onDeleteError={vi.fn()}
				onDeleted={onDeleted}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Hapus" }));
		expect(screen.getByRole("dialog")).toHaveTextContent("tautannya di sana tidak otomatis kosong");
		expect(mocks.deleteMedia).not.toHaveBeenCalled();

		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Hapus" }));
		await waitFor(() => expect(mocks.deleteMedia).toHaveBeenCalledWith("media-1"));
		expect(onDeleted).toHaveBeenCalledOnce();
	});
});
