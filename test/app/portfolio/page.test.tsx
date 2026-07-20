import { cleanup, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getProjects: vi.fn() }));

vi.mock("@/features/projects/projects.action", () => ({ getProjects: mocks.getProjects }));

import PortfolioPage from "@/app/(public)/portfolio/page";

const project = {
	demoUrl: null,
	description: "Project contoh",
	id: "project-1",
	repositoryUrl: null,
	skills: [
		{ icon: "typescript", name: "TypeScript" },
		{ icon: "nextjs", name: "Next.js" },
	],
	slug: "project-contoh",
	thumbnailImage: null,
	title: "Project Contoh",
};

describe("Portfolio page", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.getProjects.mockResolvedValue({ data: [project] });
	});

	it("renders all published projects and live statistics from one result", async () => {
		const portfolioPage = render(await PortfolioPage({ searchParams: Promise.resolve({}) }));

		expect(portfolioPage.getByRole("heading", { level: 1, name: "Portfolio" })).toBeInTheDocument();
		expect(portfolioPage.getByRole("heading", { name: "Semua Project" })).toBeInTheDocument();
		expect(portfolioPage.getByText("Project Contoh")).toBeInTheDocument();
		expect(portfolioPage.getByText("1+")).toBeInTheDocument();
		expect(portfolioPage.getByText("2+")).toBeInTheDocument();
		expect(mocks.getProjects).toHaveBeenCalledOnce();
		expect(mocks.getProjects).toHaveBeenCalledWith();
	});

	it("keeps the hero visible when no published project is available", async () => {
		mocks.getProjects.mockResolvedValue({ data: [] });

		const portfolioPage = render(await PortfolioPage({ searchParams: Promise.resolve({}) }));

		expect(portfolioPage.getByRole("heading", { level: 1, name: "Portfolio" })).toBeInTheDocument();
		expect(portfolioPage.getAllByText("0+")).toHaveLength(2);
		expect(portfolioPage.getByText("Belum ada project untuk ditampilkan.")).toBeInTheDocument();
	});

	it("paginates the project grid without changing the hero statistics", async () => {
		const projects = Array.from({ length: 7 }, (_, index) => ({
			...project,
			id: `project-${index + 1}`,
			slug: `project-${index + 1}`,
			title: `Project ${index + 1}`,
		}));
		mocks.getProjects.mockResolvedValue({ data: projects });

		const firstPage = render(await PortfolioPage({ searchParams: Promise.resolve({}) }));

		expect(firstPage.getAllByRole("link", { name: /Lihat project/ })).toHaveLength(6);
		expect(firstPage.getByRole("link", { name: "2" })).toHaveAttribute("href", "/portfolio?page=2");
		expect(firstPage.getByText("7+")).toBeInTheDocument();

		cleanup();
		const secondPage = render(await PortfolioPage({ searchParams: Promise.resolve({ page: "2" }) }));

		expect(secondPage.getAllByRole("link", { name: /Lihat project/ })).toHaveLength(1);
		expect(secondPage.getByText("Project 7")).toBeInTheDocument();
		expect(secondPage.getByRole("link", { name: "1" })).toHaveAttribute("href", "/portfolio?page=1");
	});
});
