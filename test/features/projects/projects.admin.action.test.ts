import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createAdminProject: vi.fn(),
	deleteAdminProject: vi.fn(),
	getProjectsAdmin: vi.fn(),
	getServerSession: vi.fn(),
	updateAdminProject: vi.fn(),
}));

vi.mock("@/shared/auth/server-session", () => ({
	getServerSession: mocks.getServerSession,
}));
vi.mock("@/features/projects/projects.services", () => ({
	createAdminProject: mocks.createAdminProject,
	deleteAdminProject: mocks.deleteAdminProject,
	getProjectsAdmin: mocks.getProjectsAdmin,
	getPublishedProjectBySlug: vi.fn(),
	getPublishedProjects: vi.fn(),
	updateAdminProject: mocks.updateAdminProject,
}));

import { createProject, deleteProject, getProjectsAdmin, updateProject } from "@/features/projects/projects.action";
import { PublishStatus } from "@/generated/prisma/client";

function projectFormData(values: Partial<Record<string, string>> = {}): FormData {
	const formData = new FormData();
	formData.set("title", values.title ?? "Project Baru");
	formData.set("description", values.description ?? "Deskripsi project");
	formData.set("content", values.content ?? "Isi project");
	formData.set("demoUrl", values.demoUrl ?? "");
	// biome-ignore lint/nursery/noSecrets: form field name, not a credential
	formData.set("thumbnailImage", values.thumbnailImage ?? "");
	// biome-ignore lint/nursery/noSecrets: form field name, not a credential
	formData.set("repositoryUrl", values.repositoryUrl ?? "");
	if (values.status) {
		formData.set("status", values.status);
	}
	return formData;
}

describe("project admin Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getProjectsAdmin.mockResolvedValue([]);
		mocks.createAdminProject.mockResolvedValue({ id: "project-1", slug: "project-baru" });
		mocks.updateAdminProject.mockResolvedValue({ id: "project-1", slug: "project-baru" });
		mocks.deleteAdminProject.mockResolvedValue({ id: "project-1" });
	});

	it("checks a session before every admin action", async () => {
		mocks.getServerSession.mockResolvedValue(null);

		await expect(getProjectsAdmin()).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(createProject(projectFormData())).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(updateProject("project-1", projectFormData({ status: "DRAFT" }))).resolves.toEqual({
			error: { message: "UNAUTHORIZED" },
		});
		await expect(deleteProject("project-1")).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		expect(mocks.createAdminProject).not.toHaveBeenCalled();
	});

	it("lists all projects for an authenticated admin", async () => {
		mocks.getProjectsAdmin.mockResolvedValue([
			{ description: null, id: "project-1", status: PublishStatus.ARCHIVED, title: "Project Lama" },
		]);

		await expect(getProjectsAdmin()).resolves.toEqual({
			data: [{ description: null, id: "project-1", status: "ARCHIVED", title: "Project Lama" }],
		});
	});

	it("validates form data and creates a draft by default", async () => {
		await expect(createProject(projectFormData())).resolves.toEqual({
			data: { id: "project-1", slug: "project-baru" },
		});
		expect(mocks.createAdminProject).toHaveBeenCalledWith({
			content: "Isi project",
			demoUrl: null,
			description: "Deskripsi project",
			repositoryUrl: null,
			skillIds: [],
			status: PublishStatus.DRAFT,
			tagIds: [],
			thumbnailImage: null,
			title: "Project Baru",
		});
	});

	it("returns field errors without creating an invalid project", async () => {
		const result = await createProject(projectFormData({ content: "", title: "" }));

		expect(result).toEqual({
			error: { fields: { content: "Wajib diisi.", title: "Wajib diisi." } },
		});
		expect(mocks.createAdminProject).not.toHaveBeenCalled();
	});

	it("rejects an invalid thumbnail URL before creating a project", async () => {
		const result = await createProject(projectFormData({ thumbnailImage: "not-a-url" }));

		expect(result).toEqual({ error: { fields: { thumbnailImage: "URL tidak valid." } } });
		expect(mocks.createAdminProject).not.toHaveBeenCalled();
	});

	it("updates and deletes projects for an authenticated admin", async () => {
		await expect(updateProject("project-1", projectFormData({ status: "PUBLISHED" }))).resolves.toEqual({
			data: { id: "project-1", slug: "project-baru" },
		});
		expect(mocks.updateAdminProject).toHaveBeenCalledWith(
			"project-1",
			expect.objectContaining({ status: PublishStatus.PUBLISHED }),
		);

		await expect(deleteProject("project-1")).resolves.toEqual({ data: { id: "project-1" } });
	});

	it("maps unavailable projects to the action contracts", async () => {
		mocks.updateAdminProject.mockResolvedValue(null);
		mocks.deleteAdminProject.mockResolvedValue(null);

		await expect(updateProject("missing", projectFormData({ status: "DRAFT" }))).resolves.toEqual({
			error: { fields: { _form: "Project tidak ditemukan." } },
		});
		await expect(deleteProject("missing")).resolves.toEqual({ error: { message: "Project tidak ditemukan." } });
	});

	it("does not query the database for an empty update id", async () => {
		await expect(updateProject("", projectFormData({ status: "DRAFT" }))).resolves.toEqual({
			error: { fields: { _form: "Project tidak ditemukan." } },
		});
		expect(mocks.updateAdminProject).not.toHaveBeenCalled();
	});
});
