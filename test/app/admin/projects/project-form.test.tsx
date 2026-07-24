import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createProject: vi.fn(),
	getMediaGalleryPage: vi.fn(),
	refresh: vi.fn(),
	replace: vi.fn(),
	updateProject: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh, replace: mocks.replace }) }));
vi.mock("@/features/projects/projects.action", () => ({
	createProject: mocks.createProject,
	updateProject: mocks.updateProject,
}));
vi.mock("@/features/media/media.action", () => ({ getMediaGalleryPage: mocks.getMediaGalleryPage }));
// biome-ignore lint/nursery/noSecrets: Module path, not a secret.
vi.mock("@/shared/components/RichTextEditor", () => ({
	RichTextEditor: ({ initialContent, label, name }: { initialContent: string; label: string; name: string }) => (
		<textarea aria-label={label} defaultValue={initialContent} name={name} />
	),
}));

import { ProjectForm } from "@/app/admin/projects/_components/ProjectForm";

describe("ProjectForm", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.createProject.mockResolvedValue({ data: { id: "project-1", slug: "project-baru" } });
		mocks.getMediaGalleryPage.mockResolvedValue({ data: { currentPage: 1, media: [], totalPages: 1 } });
		mocks.updateProject.mockResolvedValue({ data: { id: "project-1", slug: "project-baru" } });
	});

	it("shows validation errors without creating an incomplete project", async () => {
		const projectForm = render(<ProjectForm folders={[]} media={[]} skills={[]} tags={[]} />);

		fireEvent.submit(projectForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(projectForm.getAllByText("Wajib diisi.")).toHaveLength(3);
		});
		expect(mocks.createProject).not.toHaveBeenCalled();
	});

	it("uses a full-width project form and rich text editor", () => {
		const projectForm = render(<ProjectForm folders={[]} media={[]} skills={[]} tags={[]} />);

		expect(projectForm.container.querySelector("section")).toHaveClass("w-full");
		expect(projectForm.getByRole("textbox", { name: "Deskripsi lengkap" })).toBeInTheDocument();
	});

	it("selects multiple skills and tags using badges", () => {
		const projectForm = render(
			<ProjectForm
				folders={[]}
				media={[]}
				skills={[
					{ icon: "https://cdn.example/skills/react.png", id: "skill-1", name: "React" },
					{ icon: "https://cdn.example/skills/typescript.png", id: "skill-2", name: "TypeScript" },
				]}
				tags={[
					{ id: "tag-1", name: "Web" },
					{ id: "tag-2", name: "Portfolio" },
				]}
			/>,
		);

		fireEvent.click(projectForm.getByRole("button", { name: "React" }));
		fireEvent.click(projectForm.getByRole("button", { name: "TypeScript" }));
		fireEvent.click(projectForm.getByRole("button", { name: "portfolio" }));

		expect(projectForm.getByRole("button", { name: "React" })).toHaveAttribute("aria-pressed", "true");
		expect(projectForm.getByRole("button", { name: "TypeScript" })).toHaveAttribute("aria-pressed", "true");
		expect(projectForm.getByRole("button", { name: "portfolio" })).toHaveAttribute("aria-pressed", "true");
		expect(projectForm.container.querySelector('img[src="https://cdn.example/skills/react.png"]')).toBeInTheDocument();
	});

	it("selects a cover image from the media modal", async () => {
		mocks.getMediaGalleryPage.mockResolvedValue({
			data: {
				currentPage: 1,
				media: [{ fileName: "cover.png", folderId: "folder-1", id: "media-1", url: "https://cdn.example/cover.png" }],
				totalPages: 1,
			},
		});
		const projectForm = render(
			<ProjectForm
				folders={[{ id: "folder-1", name: "Portfolio" }]}
				media={[{ fileName: "cover.png", folderId: "folder-1", id: "media-1", url: "https://cdn.example/cover.png" }]}
				skills={[]}
				tags={[]}
			/>,
		);

		fireEvent.click(projectForm.getByRole("button", { name: "Pilih gambar sampul" }));
		fireEvent.click(projectForm.getByRole("button", { name: "Portfolio" }));
		await waitFor(() => expect(projectForm.getByRole("button", { name: "Pilih cover.png" })).toBeInTheDocument());
		fireEvent.click(projectForm.getByRole("button", { name: "Pilih cover.png" }));

		expect(projectForm.getByAltText("Pratinjau gambar sampul")).toHaveAttribute("src", "https://cdn.example/cover.png");
		expect(projectForm.queryByRole("button", { name: "Ganti Gambar" })).not.toBeInTheDocument();
	});

	it("creates a project and opens its edit page after a successful save", async () => {
		const projectForm = render(<ProjectForm folders={[]} media={[]} skills={[]} tags={[]} />);
		fireEvent.change(projectForm.getByRole("textbox", { name: "Nama project" }), { target: { value: "Project Baru" } });
		fireEvent.change(projectForm.getByRole("textbox", { name: "Deskripsi" }), {
			target: { value: "Deskripsi project" },
		});
		fireEvent.change(projectForm.getByRole("textbox", { name: "Deskripsi lengkap" }), { target: { value: "Isi project" } });

		fireEvent.submit(projectForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(mocks.createProject).toHaveBeenCalledOnce());
		expect(mocks.replace).toHaveBeenCalledWith("/admin/projects/project-1");
	});

	it("stays on the edit page after a successful update", async () => {
		const projectForm = render(
			<ProjectForm
				folders={[]}
				media={[]}
				project={{
					content: "Isi project",
					demoUrl: null,
					description: "Deskripsi project",
					id: "project-1",
					repositoryUrl: null,
					skillIds: [],
					status: "DRAFT",
					tagIds: [],
					thumbnailImage: null,
					title: "Project Lama",
				}}
				skills={[]}
				tags={[]}
			/>,
		);

		fireEvent.submit(projectForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(mocks.updateProject).toHaveBeenCalledOnce());
		expect(projectForm.getByText("Project tersimpan.")).toBeInTheDocument();
		expect(mocks.refresh).toHaveBeenCalledOnce();
		expect(mocks.replace).not.toHaveBeenCalled();
	});
});
