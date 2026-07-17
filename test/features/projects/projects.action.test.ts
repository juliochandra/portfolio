import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getPublishedProjectBySlug: vi.fn(),
	getPublishedProjects: vi.fn(),
}));

vi.mock("@/features/projects/projects.services", () => ({
	getPublishedProjectBySlug: mocks.getPublishedProjectBySlug,
	getPublishedProjects: mocks.getPublishedProjects,
}));

import { getProjectBySlug, getProjects } from "@/features/projects/projects.action";

const projectListItem = {
	description: "Gambaran project",
	id: "project-1",
	skills: [{ icon: "SiNextdotjs", name: "Next.js" }],
	slug: "portfolio-developer",
	thumbnailImage: null,
	title: "Portfolio Developer",
};

const projectDetail = {
	...projectListItem,
	content: "Deskripsi lengkap dan peran saya.",
	demoUrl: "https://example.com",
	repositoryUrl: null,
	tags: [{ name: "Portfolio" }],
};

describe("project public Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getPublishedProjects.mockResolvedValue([projectListItem]);
		mocks.getPublishedProjectBySlug.mockResolvedValue(projectDetail);
	});

	it("returns all published projects when limit is omitted", async () => {
		await expect(getProjects()).resolves.toEqual({ data: [projectListItem] });
		expect(mocks.getPublishedProjects).toHaveBeenCalledWith(undefined);
	});

	it("passes a valid limit to the project service", async () => {
		await expect(getProjects({ limit: 3 })).resolves.toEqual({ data: [projectListItem] });
		expect(mocks.getPublishedProjects).toHaveBeenCalledWith({ limit: 3 });
	});

	it("returns an empty list as a successful result", async () => {
		mocks.getPublishedProjects.mockResolvedValue([]);

		await expect(getProjects()).resolves.toEqual({ data: [] });
	});

	it("rejects an invalid limit before calling the service", async () => {
		await expect(getProjects({ limit: 0 })).rejects.toThrow("Parameter project tidak valid.");
		expect(mocks.getPublishedProjects).not.toHaveBeenCalled();
	});

	it("returns a published project by its normalized slug", async () => {
		await expect(getProjectBySlug("  portfolio-developer  ")).resolves.toEqual({
			data: projectDetail,
		});
		expect(mocks.getPublishedProjectBySlug).toHaveBeenCalledWith("portfolio-developer");
	});

	it("returns the same error for an invalid or unavailable slug", async () => {
		const invalidSlug = await getProjectBySlug("   ");
		mocks.getPublishedProjectBySlug.mockResolvedValue(null);
		const unavailableProject = await getProjectBySlug("draft-project");

		expect(invalidSlug).toEqual({ error: { message: "Project tidak ditemukan." } });
		expect(unavailableProject).toEqual(invalidSlug);
	});
});
