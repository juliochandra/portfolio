import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
	findProjectBySlug: vi.fn(),
	findProjects: vi.fn(),
}));

vi.mock("@/features/projects/projects.repository", () => ({
	findProjectBySlug: mocks.findProjectBySlug,
	findProjects: mocks.findProjects,
}));

import { getPublishedProjectBySlug, getPublishedProjects } from "@/features/projects/projects.services";

const projectRecord = {
	description: "Gambaran project",
	id: "project-1",
	skills: [
		{ icon: "SiNextdotjs", name: "Next.js" },
		{ icon: null, name: "Incomplete legacy skill" },
	],
	slug: "portfolio-developer",
	thumbnailImage: null,
	title: "Portfolio Developer",
};

describe("project public services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findProjects.mockResolvedValue([projectRecord]);
	});

	it("queries only published projects with the requested limit", async () => {
		const projects = await getPublishedProjects({ limit: 3 });

		expect(mocks.findProjects).toHaveBeenCalledWith({
			limit: 3,
			status: PublishStatus.PUBLISHED,
		});
		expect(projects).toEqual([
			{
				...projectRecord,
				skills: [{ icon: "SiNextdotjs", name: "Next.js" }],
			},
		]);
	});

	it("queries project detail with the published status", async () => {
		mocks.findProjectBySlug.mockResolvedValue({
			...projectRecord,
			content: "Deskripsi lengkap dan peran saya.",
			demoUrl: null,
			repositoryUrl: "https://github.com/example/project",
			tags: [{ name: "Portfolio" }],
		});

		const project = await getPublishedProjectBySlug("portfolio-developer");

		expect(mocks.findProjectBySlug).toHaveBeenCalledWith({
			slug: "portfolio-developer",
			status: PublishStatus.PUBLISHED,
		});
		expect(project).toMatchObject({
			content: "Deskripsi lengkap dan peran saya.",
			repositoryUrl: "https://github.com/example/project",
			tags: [{ name: "Portfolio" }],
		});
	});

	it("returns null when a published project is unavailable", async () => {
		mocks.findProjectBySlug.mockResolvedValue(null);

		await expect(getPublishedProjectBySlug("missing-project")).resolves.toBeNull();
	});
});
