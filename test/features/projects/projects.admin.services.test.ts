import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
	createProjectRecord: vi.fn(),
	deleteProjectRecord: vi.fn(),
	findProjectForAdmin: vi.fn(),
	findProjectsAdmin: vi.fn(),
	isProjectSlugAvailable: vi.fn(),
	updateProjectRecord: vi.fn(),
}));

vi.mock("@/features/projects/projects.repository", () => ({
	createProjectRecord: mocks.createProjectRecord,
	deleteProjectRecord: mocks.deleteProjectRecord,
	findProjectBySlug: vi.fn(),
	findProjectForAdmin: mocks.findProjectForAdmin,
	findProjects: vi.fn(),
	findProjectsAdmin: mocks.findProjectsAdmin,
	isProjectSlugAvailable: mocks.isProjectSlugAvailable,
	updateProjectRecord: mocks.updateProjectRecord,
}));

import {
	createAdminProject,
	deleteAdminProject,
	getProjectsAdmin,
	updateAdminProject,
} from "@/features/projects/projects.services";

const input = {
	content: "Isi project",
	demoUrl: null,
	description: "Deskripsi project",
	repositoryUrl: null,
	skillIds: ["skill-1"],
	status: PublishStatus.PUBLISHED,
	tagIds: ["tag-1"],
	thumbnailImage: null,
	title: "Project Baru",
};

describe("project admin services", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-07-17T10:00:00.000Z"));
		vi.clearAllMocks();
		mocks.isProjectSlugAvailable.mockResolvedValue(true);
		mocks.createProjectRecord.mockResolvedValue({ id: "project-1", slug: "project-baru" });
		mocks.updateProjectRecord.mockResolvedValue({ id: "project-1", slug: "project-baru" });
		mocks.deleteProjectRecord.mockResolvedValue({ id: "project-1" });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns the admin project list", async () => {
		mocks.findProjectsAdmin.mockResolvedValue([
			{ description: null, id: "project-1", status: PublishStatus.DRAFT, title: "Project Baru" },
		]);

		await expect(getProjectsAdmin()).resolves.toEqual([
			{ description: null, id: "project-1", status: PublishStatus.DRAFT, title: "Project Baru" },
		]);
	});

	it("creates a unique slug and publication timestamp for a published project", async () => {
		await expect(createAdminProject(input)).resolves.toEqual({ id: "project-1", slug: "project-baru" });
		expect(mocks.isProjectSlugAvailable).toHaveBeenCalledWith("project-baru");
		expect(mocks.createProjectRecord).toHaveBeenCalledWith({
			...input,
			publishedAt: new Date("2026-07-17T10:00:00.000Z"),
			slug: "project-baru",
		});
	});

	it("stores a provided thumbnail URL directly", async () => {
		await createAdminProject({
			...input,
			status: PublishStatus.DRAFT,
			thumbnailImage: "https://cdn.example/projects/image.png",
		});
		expect(mocks.createProjectRecord).toHaveBeenCalledWith(
			expect.objectContaining({ publishedAt: null, thumbnailImage: "https://cdn.example/projects/image.png" }),
		);
	});

	it("preserves slug and first publication date when updating without a title change", async () => {
		const firstPublishedAt = new Date("2025-01-01T00:00:00.000Z");
		mocks.findProjectForAdmin.mockResolvedValue({
			publishedAt: firstPublishedAt,
			slug: "project-baru",
			title: "Project Baru",
		});

		await updateAdminProject("project-1", { ...input, status: PublishStatus.ARCHIVED });
		expect(mocks.isProjectSlugAvailable).not.toHaveBeenCalled();
		expect(mocks.updateProjectRecord).toHaveBeenCalledWith(
			"project-1",
			expect.objectContaining({ publishedAt: firstPublishedAt, slug: "project-baru" }),
		);
	});

	it("regenerates a slug only when the title changes and publishes once", async () => {
		mocks.findProjectForAdmin.mockResolvedValue({
			publishedAt: null,
			slug: "project-lama",
			title: "Project Lama",
		});

		await updateAdminProject("project-1", input);
		expect(mocks.isProjectSlugAvailable).toHaveBeenCalledWith("project-baru", "project-1");
		expect(mocks.updateProjectRecord).toHaveBeenCalledWith(
			"project-1",
			expect.objectContaining({
				publishedAt: new Date("2026-07-17T10:00:00.000Z"),
				slug: "project-baru",
			}),
		);
	});

	it("returns null without mutating a missing project", async () => {
		mocks.findProjectForAdmin.mockResolvedValue(null);

		await expect(updateAdminProject("missing", input)).resolves.toBeNull();
		await expect(deleteAdminProject("missing")).resolves.toBeNull();
		expect(mocks.updateProjectRecord).not.toHaveBeenCalled();
		expect(mocks.deleteProjectRecord).not.toHaveBeenCalled();
	});
});
