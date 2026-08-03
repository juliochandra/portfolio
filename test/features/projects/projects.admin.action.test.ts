import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectInput } from "@/features/projects/projects.type";
import { PublishStatus } from "@/lib/publish-status";
import { NotFoundException, UnauthorizedException, ValidationException } from "@/lib/server-action-exception/exceptions";

const serializedContent = JSON.stringify({
	content: [{ content: [{ text: "Isi project", type: "text" }], type: "paragraph" }],
	type: "doc",
});

const mocks = vi.hoisted(() => ({
	createAdminProject: vi.fn(),
	deleteAdminProject: vi.fn(),
	getProjectAdminById: vi.fn(),
	getProjectsAdmin: vi.fn(),
	getProjectsAdminPage: vi.fn(),
	requireServerSession: vi.fn(),
	updateAdminProject: vi.fn(),
}));

vi.mock("@/lib/auth/server-session", () => ({
	requireServerSession: mocks.requireServerSession,
}));
vi.mock("@/features/projects/projects.services", () => ({
	createAdminProject: mocks.createAdminProject,
	deleteAdminProject: mocks.deleteAdminProject,
	getProjectAdminById: mocks.getProjectAdminById,
	getProjectsAdmin: mocks.getProjectsAdmin,
	getProjectsAdminPage: mocks.getProjectsAdminPage,
	getPublishedProjectBySlug: vi.fn(),
	getPublishedProjects: vi.fn(),
	updateAdminProject: mocks.updateAdminProject,
}));

import {
	createProject,
	deleteProject,
	getProjectAdmin,
	getProjectsAdmin,
	getProjectsAdminPage,
	updateProject,
} from "@/features/projects/projects.action";

function projectInput(values: Partial<ProjectInput> = {}): ProjectInput {
	return {
		content: serializedContent,
		demoUrl: "",
		description: "Deskripsi project",
		repositoryUrl: "",
		skillIds: [],
		status: PublishStatus.DRAFT,
		tagIds: [],
		thumbnailImage: "",
		title: "Project Baru",
		...values,
	};
}

describe("project admin Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.requireServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getProjectsAdmin.mockResolvedValue([]);
		mocks.getProjectsAdminPage.mockResolvedValue({ currentPage: 1, projects: [], totalPages: 1 });
		mocks.getProjectAdminById.mockResolvedValue({
			content: serializedContent,
			demoUrl: null,
			description: "Deskripsi project",
			id: "project-1",
			repositoryUrl: null,
			skillIds: ["skill-1"],
			status: PublishStatus.DRAFT,
			tagIds: ["tag-1"],
			thumbnailImage: null,
			title: "Project Baru",
		});
		mocks.createAdminProject.mockResolvedValue({ id: "project-1", slug: "project-baru" });
		mocks.updateAdminProject.mockResolvedValue({ id: "project-1", slug: "project-baru" });
		mocks.deleteAdminProject.mockResolvedValue({ id: "project-1" });
	});

	it("checks a session before every admin action", async () => {
		mocks.requireServerSession.mockRejectedValue(new UnauthorizedException());

		await expect(getProjectsAdmin()).resolves.toEqual({
			error: { code: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
		});
		await expect(createProject(projectInput())).resolves.toEqual({
			error: { code: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
		});
		expect(mocks.createAdminProject).not.toHaveBeenCalled();
	});

	it("forwards authenticated admin requests to the services", async () => {
		await expect(getProjectsAdminPage(2)).resolves.toEqual({ data: { currentPage: 1, projects: [], totalPages: 1 } });
		expect(mocks.getProjectsAdminPage).toHaveBeenCalledWith(2);

		await expect(getProjectAdmin("project-1")).resolves.toMatchObject({ data: { id: "project-1" } });
		await expect(createProject(projectInput())).resolves.toEqual({ data: { id: "project-1", slug: "project-baru" } });
		expect(mocks.createAdminProject).toHaveBeenCalledWith(projectInput());

		await expect(updateProject("project-1", projectInput())).resolves.toEqual({
			data: { id: "project-1", slug: "project-baru" },
		});
		expect(mocks.updateAdminProject).toHaveBeenCalledWith("project-1", projectInput());

		await expect(deleteProject("project-1")).resolves.toEqual({ data: { id: "project-1" } });
	});

	it("maps service validation and not-found errors", async () => {
		mocks.createAdminProject.mockRejectedValue(new ValidationException({ title: "Wajib diisi." }));
		await expect(createProject(projectInput({ title: "" }))).resolves.toEqual({
			error: {
				code: "VALIDATION_ERROR",
				fields: { title: "Wajib diisi." },
				message: "Input tidak valid.",
			},
		});

		mocks.deleteAdminProject.mockRejectedValue(new NotFoundException("Project tidak ditemukan."));
		await expect(deleteProject("missing")).resolves.toEqual({
			error: { code: "NOT_FOUND", message: "Project tidak ditemukan." },
		});
	});
});
