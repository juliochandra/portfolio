import { cleanup, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getContactInfo: vi.fn(),
	getPosts: vi.fn(),
	getProjects: vi.fn(),
	getSkills: vi.fn(),
}));

vi.mock("@/features/contact/contact.action", () => ({ getContactInfo: mocks.getContactInfo }));
vi.mock("@/features/posts/posts.action", () => ({ getPosts: mocks.getPosts }));
vi.mock("@/features/projects/projects.action", () => ({ getProjects: mocks.getProjects }));
vi.mock("@/features/skills/skills.action", () => ({ getSkills: mocks.getSkills }));

import Page from "@/app/(public)/page";

const project = {
	demoUrl: "https://demo.example.com",
	description: "Project contoh",
	id: "project-1",
	repositoryUrl: "https://github.com/example/project",
	skills: [{ icon: "typescript", name: "TypeScript" }],
	slug: "project-contoh",
	thumbnailImage: null,
	title: "Project Contoh",
};

const post = {
	description: "Tulisan contoh",
	id: "post-1",
	publishedAt: "2026-07-17T02:00:00.000Z",
	readingTime: 5,
	slug: "tulisan-contoh",
	tags: [{ name: "Next.js" }],
	thumbnailImage: null,
	title: "Tulisan Contoh",
};

describe("Home page", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.getContactInfo.mockResolvedValue({
			data: [{ icon: null, id: "contact-1", label: "Email", value: "hello@example.com" }],
		});
		mocks.getPosts.mockResolvedValue({ data: [post] });
		mocks.getProjects.mockResolvedValue({ data: [project] });
		mocks.getSkills.mockResolvedValue({ data: [{ icon: "typescript", id: "skill-1", name: "TypeScript" }] });
	});

	it("renders the independent content highlights and contact email", async () => {
		const home = render(await Page());

		expect(home.getByRole("heading", { level: 1, name: "JULIO." })).toBeInTheDocument();
		expect(home.getByText("Teknologi yang Saya Kuasai")).toBeInTheDocument();
		expect(home.getByText("Project Contoh")).toBeInTheDocument();
		expect(home.getByText("Tulisan Contoh")).toBeInTheDocument();
		expect(home.getByRole("link", { name: "Kirim Email" })).toHaveAttribute("href", "mailto:hello@example.com");
		expect(mocks.getProjects).toHaveBeenCalledWith({ limit: 3 });
		expect(mocks.getPosts).toHaveBeenCalledWith({ limit: 3 });
		expect(mocks.getSkills).toHaveBeenCalledOnce();
	});

	it("keeps the hero and call to action when all highlights are empty", async () => {
		mocks.getPosts.mockResolvedValue({ data: [] });
		mocks.getProjects.mockResolvedValue({ data: [] });
		mocks.getSkills.mockResolvedValue({ data: [] });

		const home = render(await Page());

		expect(home.getByRole("heading", { level: 1, name: "JULIO." })).toBeInTheDocument();
		expect(home.getByText("Punya Project dalam Pikiran? Mari Bangun Sesuatu yang Hebat Bersama.")).toBeInTheDocument();
		expect(home.getByText("Belum ada skill yang ditampilkan.")).toBeInTheDocument();
		expect(home.getByText("Belum ada project yang ditampilkan.")).toBeInTheDocument();
		expect(home.getByText("Belum ada artikel yang ditampilkan.")).toBeInTheDocument();
	});
});
