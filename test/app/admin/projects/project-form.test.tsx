import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createProject: vi.fn(),
	push: vi.fn(),
	refresh: vi.fn(),
	updateProject: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }) }));
vi.mock("@/features/projects/projects.action", () => ({
	createProject: mocks.createProject,
	updateProject: mocks.updateProject,
}));

import { ProjectForm } from "@/app/admin/projects/_components/ProjectForm";

describe("ProjectForm", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.createProject.mockResolvedValue({ data: { id: "project-1", slug: "project-baru" } });
	});

	it("shows validation errors without creating an incomplete project", async () => {
		const projectForm = render(<ProjectForm media={[]} skills={[]} tags={[]} />);

		fireEvent.submit(projectForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(projectForm.getAllByText("Wajib diisi.")).toHaveLength(3);
		});
		expect(mocks.createProject).not.toHaveBeenCalled();
	});

	it("creates a project and returns to the list after a successful save", async () => {
		const projectForm = render(<ProjectForm media={[]} skills={[]} tags={[]} />);
		fireEvent.change(projectForm.getByRole("textbox", { name: "Nama project" }), { target: { value: "Project Baru" } });
		fireEvent.change(projectForm.getByRole("textbox", { name: "Gambaran singkat" }), {
			target: { value: "Deskripsi project" },
		});
		fireEvent.change(projectForm.getByRole("textbox", { name: "Deskripsi lengkap" }), { target: { value: "Isi project" } });

		fireEvent.submit(projectForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(mocks.createProject).toHaveBeenCalledOnce();
		});
		expect(mocks.push).toHaveBeenCalledWith("/admin/projects?message=saved");
	});
});
