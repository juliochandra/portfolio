import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createTag: vi.fn(),
	deleteTag: vi.fn(),
	refresh: vi.fn(),
	updateTag: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/features/tags/tags.action", () => ({
	createTag: mocks.createTag,
	deleteTag: mocks.deleteTag,
	updateTag: mocks.updateTag,
}));

import { TagsManager } from "@/app/admin/tags/_components/TagsManager";

describe("TagsManager", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.createTag.mockResolvedValue({ data: { id: "tag-1" } });
		mocks.updateTag.mockResolvedValue({ data: { id: "tag-1" } });
		mocks.deleteTag.mockResolvedValue({ data: { id: "tag-1" } });
	});

	it("shows a validation error without creating an empty tag", async () => {
		const manager = render(<TagsManager initialTags={[]} />);

		fireEvent.submit(manager.getByRole("button", { name: "+ Tambah" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(manager.getByText("Wajib diisi.")).toBeInTheDocument());
		expect(mocks.createTag).not.toHaveBeenCalled();
	});

	it("creates a tag and refreshes the list", async () => {
		const manager = render(<TagsManager initialTags={[]} />);
		fireEvent.change(manager.getByRole("textbox", { name: "Nama" }), { target: { value: "Next.js" } });

		fireEvent.submit(manager.getByRole("button", { name: "+ Tambah" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(mocks.createTag).toHaveBeenCalledWith({ name: "Next.js" }));
		expect(mocks.refresh).toHaveBeenCalledOnce();
	});

	it("fills the form, updates, and confirms deletion of a tag", async () => {
		const manager = render(<TagsManager initialTags={[{ id: "tag-1", name: "Next.js" }]} />);

		fireEvent.click(screen.getByRole("button", { name: "Ubah" }));
		expect(manager.getByRole("textbox", { name: "Nama" })).toHaveValue("Next.js");

		fireEvent.change(manager.getByRole("textbox", { name: "Nama" }), { target: { value: "React" } });
		fireEvent.submit(manager.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(mocks.updateTag).toHaveBeenCalledWith("tag-1", { name: "React" }));

		fireEvent.click(screen.getByRole("button", { name: "Hapus" }));
		expect(screen.getByRole("dialog")).toHaveTextContent("Project/Tulisan yang memakainya tidak ikut terhapus");
		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Hapus" }));
		await waitFor(() => expect(mocks.deleteTag).toHaveBeenCalledWith("tag-1"));
	});
});
