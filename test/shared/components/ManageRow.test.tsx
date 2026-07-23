import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/generated/prisma/client";
import { ManageRow } from "@/shared/components/ManageRow";

describe("ManageRow", () => {
	beforeEach(() => {
		cleanup();
	});

	it("requires confirmation before deleting an item", async () => {
		const onDelete = vi.fn().mockResolvedValue(undefined);
		render(
			<ManageRow
				description="Deskripsi project"
				editHref="/admin/projects/project-1"
				onDelete={onDelete}
				status={PublishStatus.PUBLISHED}
				title="Project Baru"
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Hapus" }));
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(onDelete).not.toHaveBeenCalled();

		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Hapus" }));
		await waitFor(() => expect(onDelete).toHaveBeenCalledOnce());
		expect(screen.getByRole("link", { name: "Ubah" })).toHaveAttribute("href", "/admin/projects/project-1");
	});

	it("uses the provided item type in the confirmation message", () => {
		render(
			<ManageRow
				description="17 Juli 2026"
				editHref="/admin/posts/post-1"
				itemType="tulisan"
				onDelete={vi.fn()}
				status={PublishStatus.DRAFT}
				title="Tulisan Baru"
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Hapus" }));
		expect(screen.getByRole("dialog")).toHaveTextContent("Hapus tulisan 'Tulisan Baru'?");
	});
});
