import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundException, ValidationException } from "@/lib/server-action-exception/exceptions";
import type { RichTextDocument } from "@/lib/tiptap/json";

const mocks = vi.hoisted(() => ({
	getPublishedProjectBySlug: vi.fn(),
	getPublishedProjects: vi.fn(),
}));

vi.mock("@/features/projects/projects.services", () => ({
	getPublishedProjectBySlug: mocks.getPublishedProjectBySlug,
	getPublishedProjects: mocks.getPublishedProjects,
}));

import { getProjectBySlug, getProjects } from "@/features/projects/projects.action";

const content: RichTextDocument = {
	content: [{ content: [{ text: "Deskripsi lengkap project.", type: "text" }], type: "paragraph" }],
	type: "doc",
};

const project = {
	demoUrl: "https://demo.example.com",
	description: "Gambaran project",
	id: "project-1",
	repositoryUrl: null,
	skills: [{ icon: "SiNextdotjs", name: "Next.js" }],
	slug: "portfolio-developer",
	thumbnailImage: null,
	title: "Portfolio Developer",
};

describe("project public Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getPublishedProjects.mockResolvedValue([project]);
		mocks.getPublishedProjectBySlug.mockResolvedValue({
			...project,
			content,
			publishedAt: new Date("2026-07-20T00:00:00.000Z"),
			tags: [{ name: "Portfolio" }],
		});
	});

	it("forwards project list parameters to the service", async () => {
		await expect(getProjects({ limit: 3 })).resolves.toEqual({ data: [project] });
		expect(mocks.getPublishedProjects).toHaveBeenCalledWith({ limit: 3 });
	});

	it("maps validation errors from the service", async () => {
		mocks.getPublishedProjects.mockRejectedValue(
			new ValidationException({ limit: "Number must be greater than 0" }, "Parameter project tidak valid."),
		);

		await expect(getProjects({ limit: 0 })).resolves.toEqual({
			error: {
				code: "VALIDATION_ERROR",
				fields: { limit: "Number must be greater than 0" },
				message: "Parameter project tidak valid.",
			},
		});
	});

	it("returns a published project from the service", async () => {
		await expect(getProjectBySlug("portfolio-developer")).resolves.toMatchObject({
			data: { id: "project-1", title: "Portfolio Developer" },
		});
	});

	it("maps unavailable projects to a not-found error", async () => {
		mocks.getPublishedProjectBySlug.mockRejectedValue(new NotFoundException("Project tidak ditemukan."));

		await expect(getProjectBySlug("draft-project")).resolves.toEqual({
			error: { code: "NOT_FOUND", message: "Project tidak ditemukan." },
		});
	});
});
