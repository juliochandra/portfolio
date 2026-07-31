import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	findMany: vi.fn(),
}));

vi.mock("@/lib/database/prisma", () => ({
	prisma: {
		skill: {
			findMany: mocks.findMany,
		},
	},
}));

import { findSkills } from "@/features/skills/skills.repository";

describe("skill repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
	});

	it("selects only public fields without filters or forced ordering", async () => {
		await findSkills();

		expect(mocks.findMany).toHaveBeenCalledWith({
			select: {
				icon: true,
				id: true,
				name: true,
			},
		});
	});
});
