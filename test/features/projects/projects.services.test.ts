import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/lib/publish-status";
import { NotFoundException } from "@/lib/server-action-exception/exceptions";
import type { RichTextDocument } from "@/lib/tiptap/json";

const content: RichTextDocument = {
	content: [{ content: [{ text: "Deskripsi lengkap dan peran saya.", type: "text" }], type: "paragraph" }],
	type: "doc",
};

const serializedContent = JSON.stringify(content);

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
	demoUrl: "https://demo.example.com",
	description: "Gambaran project",
	id: "project-1",
	repositoryUrl: null,
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
			content: serializedContent,
			demoUrl: "https://demo.example.com",
			publishedAt: new Date("2026-07-20T00:00:00.000Z"),
			repositoryUrl: "https://github.com/example/project",
			tags: [{ name: "Portfolio" }],
		});

		const project = await getPublishedProjectBySlug("portfolio-developer");

		expect(mocks.findProjectBySlug).toHaveBeenCalledWith({
			slug: "portfolio-developer",
			status: PublishStatus.PUBLISHED,
		});
		expect(project).toMatchObject({
			content,
			publishedAt: new Date("2026-07-20T00:00:00.000Z"),
			repositoryUrl: "https://github.com/example/project",
			tags: [{ name: "Portfolio" }],
		});
	});

	it("rejects when a published project is unavailable", async () => {
		mocks.findProjectBySlug.mockResolvedValue(null);

		await expect(getPublishedProjectBySlug("missing-project")).rejects.toBeInstanceOf(NotFoundException);
	});
});
