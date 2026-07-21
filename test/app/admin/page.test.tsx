import { cleanup, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getDashboardSummary: vi.fn(),
}));

vi.mock("@/features/dashboard/dashboard.action", () => ({ getDashboardSummary: mocks.getDashboardSummary }));

import AdminPage from "@/app/admin/page";

const dashboardSummary = {
	publishedPosts: 2,
	publishedProjects: 1,
	recentPosts: [
		{
			createdAt: "2026-07-20T00:00:00.000Z",
			id: "post-1",
			status: "PUBLISHED" as const,
			tags: [{ name: "nextjs" }],
			thumbnailImage: null,
			title: "Post terbaru",
		},
	],
	recentProjects: [
		{
			createdAt: "2026-07-19T00:00:00.000Z",
			id: "project-1",
			skills: [{ name: "TypeScript" }],
			status: "DRAFT" as const,
			thumbnailImage: null,
			title: "Project terbaru",
		},
	],
	totalPosts: 3,
	totalProjects: 2,
	totalSkills: 4,
	totalTags: 5,
};

describe("AdminPage", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("shows dashboard statistics, recent items, and quick actions", async () => {
		mocks.getDashboardSummary.mockResolvedValue({ data: dashboardSummary });
		const page = render(await AdminPage());

		expect(page.getByText("Total Posts")).toBeInTheDocument();
		expect(page.getByText("Published: 2")).toBeInTheDocument();
		expect(page.getByText("Total Projects")).toBeInTheDocument();
		expect(page.getByText("Recent Posts")).toBeInTheDocument();
		expect(page.getByText("Post terbaru")).toBeInTheDocument();
		expect(page.getByText("nextjs")).toBeInTheDocument();
		expect(page.getByText("Recent Projects")).toBeInTheDocument();
		expect(page.getByText("Project terbaru")).toBeInTheDocument();
		expect(page.getByText("TypeScript")).toBeInTheDocument();
		expect(page.getByRole("link", { name: "New Post" })).toHaveAttribute("href", "/admin/posts/new");
		expect(page.getByRole("link", { name: "View Messages" })).toHaveAttribute("href", "/admin/messages");
	});

	it("renders empty recent lists without an error", async () => {
		mocks.getDashboardSummary.mockResolvedValue({
			data: {
				...dashboardSummary,
				recentPosts: [],
				recentProjects: [],
				totalPosts: 0,
				totalProjects: 0,
				totalSkills: 0,
				totalTags: 0,
			},
		});
		const page = render(await AdminPage());

		expect(page.getByRole("heading", { name: "Total Posts" }).previousSibling).toHaveTextContent("0");
		expect(page.queryByText("Post terbaru")).not.toBeInTheDocument();
		expect(page.queryByText("Project terbaru")).not.toBeInTheDocument();
	});
});
