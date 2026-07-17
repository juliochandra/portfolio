import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	create: vi.fn(),
	delete: vi.fn(),
	findMany: vi.fn(),
	findUnique: vi.fn(),
	update: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
	prisma: {
		skill: {
			create: mocks.create,
			delete: mocks.delete,
			findMany: mocks.findMany,
			findUnique: mocks.findUnique,
			update: mocks.update,
		},
	},
}));

import {
	createSkillRecord,
	findSkillsAdmin,
	isSkillNameAvailable,
	isSkillSlugAvailable,
	updateSkillRecord,
} from "@/features/skills/skills.repository";

const input = {
	icon: "typescript",
	name: "TypeScript",
	slug: "typescript",
};

describe("skill admin repository", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
		mocks.create.mockResolvedValue({ id: "skill-1" });
		mocks.update.mockResolvedValue({ id: "skill-1" });
	});

	it("lists all skills using the admin projection", async () => {
		await findSkillsAdmin();

		expect(mocks.findMany).toHaveBeenCalledWith({
			select: { icon: true, id: true, name: true },
		});
	});

	it("creates and updates only skill fields", async () => {
		await createSkillRecord(input);
		expect(mocks.create).toHaveBeenCalledWith({ data: input, select: { id: true } });

		await updateSkillRecord("skill-1", input);
		expect(mocks.update).toHaveBeenCalledWith({ data: input, select: { id: true }, where: { id: "skill-1" } });
	});

	it("checks name and slug availability", async () => {
		mocks.findUnique.mockResolvedValue({ id: "skill-2" });

		await expect(isSkillNameAvailable("TypeScript")).resolves.toBe(false);
		await expect(isSkillNameAvailable("TypeScript", "skill-2")).resolves.toBe(true);
		await expect(isSkillSlugAvailable("typescript")).resolves.toBe(false);
		await expect(isSkillSlugAvailable("typescript", "skill-2")).resolves.toBe(true);
	});
});
