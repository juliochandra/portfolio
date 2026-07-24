import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createSkillRecord: vi.fn(),
	deleteSkillRecord: vi.fn(),
	findSkillForAdmin: vi.fn(),
	findSkillsAdmin: vi.fn(),
	isSkillNameAvailable: vi.fn(),
	isSkillSlugAvailable: vi.fn(),
	updateSkillRecord: vi.fn(),
}));

vi.mock("@/features/skills/skills.repository", () => ({
	createSkillRecord: mocks.createSkillRecord,
	deleteSkillRecord: mocks.deleteSkillRecord,
	findSkillForAdmin: mocks.findSkillForAdmin,
	findSkills: vi.fn(),
	findSkillsAdmin: mocks.findSkillsAdmin,
	isSkillNameAvailable: mocks.isSkillNameAvailable,
	isSkillSlugAvailable: mocks.isSkillSlugAvailable,
	updateSkillRecord: mocks.updateSkillRecord,
}));

import { createAdminSkill, deleteAdminSkill, getSkillsAdmin, updateAdminSkill } from "@/features/skills/skills.services";

const input = {
	icon: "typescript",
	name: "TypeScript",
};

describe("skill admin services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.isSkillNameAvailable.mockResolvedValue(true);
		mocks.isSkillSlugAvailable.mockResolvedValue(true);
		mocks.createSkillRecord.mockResolvedValue({ id: "skill-1" });
		mocks.updateSkillRecord.mockResolvedValue({ id: "skill-1" });
		mocks.deleteSkillRecord.mockResolvedValue({ id: "skill-1" });
	});

	it("returns the admin skill list", async () => {
		mocks.findSkillsAdmin.mockResolvedValue([{ icon: null, id: "skill-1", name: "TypeScript" }]);

		await expect(getSkillsAdmin()).resolves.toEqual([{ icon: null, id: "skill-1", name: "TypeScript" }]);
	});

	it("creates a unique slug from the skill name", async () => {
		await expect(createAdminSkill(input)).resolves.toEqual({ id: "skill-1" });
		expect(mocks.isSkillNameAvailable).toHaveBeenCalledWith("TypeScript");
		expect(mocks.isSkillSlugAvailable).toHaveBeenCalledWith("typescript");
		expect(mocks.createSkillRecord).toHaveBeenCalledWith({ ...input, slug: "typescript" });
	});

	it("does not create a duplicate name", async () => {
		mocks.isSkillNameAvailable.mockResolvedValue(false);

		await expect(createAdminSkill(input)).resolves.toBe("name_taken");
		expect(mocks.createSkillRecord).not.toHaveBeenCalled();
	});

	it("updates the icon without changing a stable name and slug", async () => {
		mocks.findSkillForAdmin.mockResolvedValue({ id: "skill-1", name: "TypeScript", slug: "typescript" });

		await updateAdminSkill("skill-1", { ...input, icon: "ts" });
		expect(mocks.isSkillNameAvailable).not.toHaveBeenCalled();
		expect(mocks.isSkillSlugAvailable).not.toHaveBeenCalled();
		expect(mocks.updateSkillRecord).toHaveBeenCalledWith("skill-1", { icon: "ts", name: "TypeScript", slug: "typescript" });
	});

	it("rejects a duplicate name and generates a slug only after a name change", async () => {
		mocks.findSkillForAdmin.mockResolvedValue({ id: "skill-1", name: "JavaScript", slug: "javascript" });
		mocks.isSkillNameAvailable.mockResolvedValue(false);

		await expect(updateAdminSkill("skill-1", input)).resolves.toBe("name_taken");
		expect(mocks.updateSkillRecord).not.toHaveBeenCalled();

		mocks.isSkillNameAvailable.mockResolvedValue(true);
		await updateAdminSkill("skill-1", input);
		expect(mocks.isSkillSlugAvailable).toHaveBeenCalledWith("typescript", "skill-1");
		expect(mocks.updateSkillRecord).toHaveBeenCalledWith("skill-1", { ...input, slug: "typescript" });
	});

	it("does not mutate a missing skill", async () => {
		mocks.findSkillForAdmin.mockResolvedValue(null);

		await expect(updateAdminSkill("missing", input)).resolves.toBeNull();
		await expect(deleteAdminSkill("missing")).resolves.toBeNull();
		expect(mocks.updateSkillRecord).not.toHaveBeenCalled();
		expect(mocks.deleteSkillRecord).not.toHaveBeenCalled();
	});
});
