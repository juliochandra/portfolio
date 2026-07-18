import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/dashboard/dashboard.repository", () => ({ getDashboardRecords: vi.fn() }));

import { getDashboardRecords } from "@/features/dashboard/dashboard.repository";
import { getDashboardSummary } from "@/features/dashboard/dashboard.services";

describe("dashboard service", () => {
	it("maps counts and ISO dates", async () => {
		vi.mocked(getDashboardRecords).mockResolvedValue({
			posts: 2,
			projects: 3,
			publishedPosts: 1,
			publishedProjects: 2,
			skills: 4,
			tags: 5,
			recentPosts: [
				{ createdAt: new Date("2026-07-18T00:00:00.000Z"), id: "p", status: "DRAFT", thumbnailImage: null, title: "Post" },
			],
			recentProjects: [],
		});
		await expect(getDashboardSummary()).resolves.toEqual(
			expect.objectContaining({
				totalPosts: 2,
				totalProjects: 3,
				totalSkills: 4,
				totalTags: 5,
				recentPosts: [expect.objectContaining({ createdAt: "2026-07-18T00:00:00.000Z" })],
			}),
		);
	});
});
