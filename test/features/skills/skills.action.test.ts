import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getPublicSkills: vi.fn(),
}));

vi.mock("@/features/skills/skills.services", () => ({
	getPublicSkills: mocks.getPublicSkills,
}));

import { getSkills } from "@/features/skills/skills.action";

const skill = {
	icon: "typescript",
	id: "skill-1",
	name: "TypeScript",
};

describe("skill public Server Action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getPublicSkills.mockResolvedValue([skill]);
	});

	it("returns every public skill", async () => {
		await expect(getSkills()).resolves.toEqual({ data: [skill] });
	});

	it("returns an empty list as a successful result", async () => {
		mocks.getPublicSkills.mockResolvedValue([]);

		await expect(getSkills()).resolves.toEqual({ data: [] });
	});
});
