import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	postCount: vi.fn(),
	postFindMany: vi.fn(),
	projectCount: vi.fn(),
	projectFindMany: vi.fn(),
	skillCount: vi.fn(),
	tagCount: vi.fn(),
}));

vi.mock("@/lib/database/prisma", () => ({
	prisma: {
		post: { count: mocks.postCount, findMany: mocks.postFindMany },
		project: { count: mocks.projectCount, findMany: mocks.projectFindMany },
		skill: { count: mocks.skillCount },
		tag: { count: mocks.tagCount },
	},
}));

import { getDashboardRecords } from "@/features/dashboard/dashboard.repository";

describe("dashboard repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.postCount.mockResolvedValue(0);
		mocks.postFindMany.mockResolvedValue([]);
		mocks.projectCount.mockResolvedValue(0);
		mocks.projectFindMany.mockResolvedValue([]);
		mocks.skillCount.mockResolvedValue(0);
		mocks.tagCount.mockResolvedValue(0);
	});

	it("loads five newest items and their dashboard labels", async () => {
		await getDashboardRecords();

		expect(mocks.postFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				orderBy: { createdAt: "desc" },
				select: expect.objectContaining({ tags: { select: { name: true } } }),
				take: 5,
			}),
		);
		expect(mocks.projectFindMany).toHaveBeenCalledWith(
			expect.objectContaining({
				orderBy: { createdAt: "desc" },
				select: expect.objectContaining({ skills: { select: { name: true } } }),
				take: 5,
			}),
		);
	});
});
