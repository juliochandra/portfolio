import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/shared/publish-status";

const mocks = vi.hoisted(() => ({
	findFirst: vi.fn(),
	findMany: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
	prisma: {
		project: {
			findFirst: mocks.findFirst,
			findMany: mocks.findMany,
		},
	},
}));

import { findProjectBySlug, findProjects } from "@/features/projects/projects.repository";

describe("project repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
		mocks.findFirst.mockResolvedValue(null);
	});

	it("filters, orders, and limits project list queries", async () => {
		await findProjects({ limit: 3, status: PublishStatus.PUBLISHED });

		expect(mocks.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				orderBy: { publishedAt: "desc" },
				select: expect.objectContaining({ demoUrl: true, repositoryUrl: true }),
				take: 3,
				where: { status: PublishStatus.PUBLISHED },
			}),
		);
	});

	it("queries project detail by slug and status together", async () => {
		await findProjectBySlug({
			slug: "portfolio-developer",
			status: PublishStatus.PUBLISHED,
		});

		expect(mocks.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				select: expect.objectContaining({ publishedAt: true }),
				where: {
					slug: "portfolio-developer",
					status: PublishStatus.PUBLISHED,
				},
			}),
		);
	});
});
