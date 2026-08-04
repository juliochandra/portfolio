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

import { TagsManager } from "@/components/admin/tags/TagsManager";

describe("TagsManager", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.createTag.mockResolvedValue({ data: { id: "tag-1" } });
		mocks.updateTag.mockResolvedValue({ data: { id: "tag-1" } });
		mocks.deleteTag.mockResolvedValue({ data: { id: "tag-1" } });
	});

	it("shows validation errors returned by the Server Action", async () => {
		mocks.createTag.mockResolvedValue({
			error: {
				code: "VALIDATION_ERROR",
				fields: { name: "Wajib diisi." },
				message: "Input tidak valid.",
			},
		});
		const manager = render(<TagsManager initialTags={[]} />);
		fireEvent.click(manager.getByRole("button", { name: "Tambah Tag" }));
		const dialog = manager.getByRole("dialog", { name: "Tambah Tag" });

		fireEvent.submit(within(dialog).getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(within(dialog).getByText("Wajib diisi.")).toBeInTheDocument());
		expect(mocks.createTag).toHaveBeenCalledOnce();
	});

	it("creates a tag from the compact form dialog", async () => {
		const manager = render(<TagsManager initialTags={[]} />);
		fireEvent.click(manager.getByRole("button", { name: "Tambah Tag" }));
		const dialog = manager.getByRole("dialog", { name: "Tambah Tag" });
		fireEvent.change(within(dialog).getByRole("textbox", { name: "Nama tag" }), { target: { value: "Next.js" } });

		fireEvent.submit(within(dialog).getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(mocks.createTag).toHaveBeenCalledWith({ name: "Next.js" }));
		expect(mocks.refresh).toHaveBeenCalledOnce();
	});

	it("sorts tags and filters the compact list", () => {
		const manager = render(
			<TagsManager
				initialTags={[
					{ id: "tag-1", name: "Zod" },
					{ id: "tag-2", name: "React" },
				]}
			/>,
		);

		expect(manager.getByRole("list", { name: "Daftar tag" })).toHaveTextContent("reactzod");
		fireEvent.change(manager.getByRole("textbox", { name: "Cari tag" }), { target: { value: "react" } });
		expect(manager.getByRole("list", { name: "Daftar tag" })).toHaveTextContent("react");
		expect(manager.queryByText("zod")).not.toBeInTheDocument();
	});

	it("fills the edit dialog and confirms deletion of a tag", async () => {
		const manager = render(<TagsManager initialTags={[{ id: "tag-1", name: "Next.js" }]} />);

		fireEvent.click(screen.getByRole("button", { name: "next.js" }));
		const formDialog = manager.getByRole("dialog", { name: "Ubah Tag" });
		expect(within(formDialog).getByRole("textbox", { name: "Nama tag" })).toHaveValue("Next.js");

		fireEvent.change(within(formDialog).getByRole("textbox", { name: "Nama tag" }), { target: { value: "React" } });
		fireEvent.submit(within(formDialog).getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(mocks.updateTag).toHaveBeenCalledWith("tag-1", { name: "React" }));

		fireEvent.click(screen.getByRole("button", { name: "next.js" }));
		const deleteFormDialog = manager.getByRole("dialog", { name: "Ubah Tag" });
		fireEvent.click(within(deleteFormDialog).getByRole("button", { name: "Hapus" }));
		const deleteDialog = screen.getByRole("dialog");
		expect(deleteDialog).toHaveTextContent("Project/Tulisan yang memakainya tidak ikut terhapus");
		fireEvent.click(within(deleteDialog).getByRole("button", { name: "Hapus" }));
		await waitFor(() => expect(mocks.deleteTag).toHaveBeenCalledWith("tag-1"));
	});
});
