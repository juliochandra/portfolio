/** biome-ignore-all lint/nursery/noSecrets: Fixture project content is not sensitive. */
import { cleanup, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getProjectBySlug: vi.fn(),
	notFound: vi.fn(),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/features/projects/projects.action", () => ({ getProjectBySlug: mocks.getProjectBySlug }));

import ProjectDetailPage from "@/app/(public)/portfolio/[slug]/page";
import type { RichTextDocument } from "@/lib/tiptap/json";

const content: RichTextDocument = {
	content: [{ content: [{ text: "Project ini dibangun untuk pengguna.", type: "text" }], type: "paragraph" }],
	type: "doc",
};

const project = {
	content,
	demoUrl: "https://demo.example.com",
	description: "Gambaran project contoh.",
	id: "project-1",
	publishedAt: new Date("2026-07-20T00:00:00.000Z"),
	repositoryUrl: "https://github.com/example/project",
	skills: [{ icon: "typescript", name: "TypeScript" }],
	slug: "project-contoh",
	tags: [{ name: "Portfolio" }],
	thumbnailImage: "https://example.com/project.png",
	title: "Project Contoh",
};

describe("Project detail page", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.getProjectBySlug.mockResolvedValue({ data: project });
	});

	it("renders separate tags, skills, overview, and available external links", async () => {
		const projectPage = render(await ProjectDetailPage({ params: Promise.resolve({ slug: project.slug }) }));

		expect(projectPage.getByRole("heading", { level: 1, name: project.title })).toBeInTheDocument();
		expect(projectPage.getByRole("heading", { name: "Tags" })).toBeInTheDocument();
		expect(projectPage.getByRole("heading", { name: "Skills & Technologies" })).toBeInTheDocument();
		expect(projectPage.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
		expect(projectPage.getByText("Published • 20 Juli 2026")).toBeInTheDocument();
		expect(projectPage.getByRole("link", { name: "Lihat Demo" })).toHaveAttribute("href", project.demoUrl);
		expect(projectPage.getByRole("link", { name: "Lihat Kode" })).toHaveAttribute("href", project.repositoryUrl);
	});

	it("uses Next.js notFound when the project is unavailable", async () => {
		mocks.getProjectBySlug.mockResolvedValue({ error: { message: "Project tidak ditemukan." } });
		mocks.notFound.mockImplementation(() => {
			throw new Error("not found");
		});

		await expect(ProjectDetailPage({ params: Promise.resolve({ slug: "missing-project" }) })).rejects.toThrow("not found");
		expect(mocks.notFound).toHaveBeenCalledOnce();
	});
});
