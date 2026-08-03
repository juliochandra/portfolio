import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnauthorizedException } from "@/lib/server-action-exception/exceptions";

const mocks = vi.hoisted(() => ({
	getDashboardSummary: vi.fn(),
	requireServerSession: vi.fn(),
}));

vi.mock("@/features/dashboard/dashboard.services", () => ({
	getDashboardSummary: mocks.getDashboardSummary,
}));
vi.mock("@/lib/auth/server-session", () => ({
	requireServerSession: mocks.requireServerSession,
}));

import { getDashboardSummary } from "@/features/dashboard/dashboard.action";

const dashboardSummary = {
	publishedPosts: 1,
	publishedProjects: 1,
	recentPosts: [],
	recentProjects: [],
	totalPosts: 1,
	totalProjects: 1,
	totalSkills: 1,
	totalTags: 1,
};

describe("dashboard Server Action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.requireServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getDashboardSummary.mockResolvedValue(dashboardSummary);
	});

	it("returns the dashboard summary for an authenticated admin", async () => {
		await expect(getDashboardSummary()).resolves.toEqual({ data: dashboardSummary });
		expect(mocks.requireServerSession).toHaveBeenCalledOnce();
	});

	it("returns an unauthorized error without loading the dashboard", async () => {
		mocks.requireServerSession.mockRejectedValue(new UnauthorizedException("UNAUTHORIZED"));

		await expect(getDashboardSummary()).resolves.toEqual({
			error: { code: "UNAUTHORIZED", message: "UNAUTHORIZED" },
		});
		expect(mocks.getDashboardSummary).not.toHaveBeenCalled();
	});
});
