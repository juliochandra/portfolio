import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	findSkills: vi.fn(),
}));

vi.mock("@/features/skills/skills.repository", () => ({
	findSkills: mocks.findSkills,
}));

import { getPublicSkills } from "@/features/skills/skills.services";

describe("skill public service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("maps all skills and preserves a nullable icon", async () => {
		const records = [
			{ icon: "typescript", id: "skill-1", name: "TypeScript" },
			{ icon: null, id: "skill-2", name: "Legacy Skill" },
		];
		mocks.findSkills.mockResolvedValue(records);

		await expect(getPublicSkills()).resolves.toEqual(records);
		expect(mocks.findSkills).toHaveBeenCalledOnce();
	});
});
