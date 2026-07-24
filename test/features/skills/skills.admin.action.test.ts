import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createAdminSkill: vi.fn(),
	deleteAdminSkill: vi.fn(),
	getServerSession: vi.fn(),
	getSkillsAdmin: vi.fn(),
	updateAdminSkill: vi.fn(),
}));

vi.mock("@/shared/auth/server-session", () => ({
	getServerSession: mocks.getServerSession,
}));
vi.mock("@/features/skills/skills.services", () => ({
	createAdminSkill: mocks.createAdminSkill,
	deleteAdminSkill: mocks.deleteAdminSkill,
	getPublicSkills: vi.fn(),
	getSkillsAdmin: mocks.getSkillsAdmin,
	updateAdminSkill: mocks.updateAdminSkill,
}));

import { createSkill, deleteSkill, getSkillsAdmin, updateSkill } from "@/features/skills/skills.action";

const skillIconUrl = "https://cdn.example/skills/typescript.png";

function skillInput(values: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		icon: skillIconUrl,
		name: "TypeScript",
		...values,
	};
}

describe("skill admin Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getSkillsAdmin.mockResolvedValue([]);
		mocks.createAdminSkill.mockResolvedValue({ id: "skill-1" });
		mocks.updateAdminSkill.mockResolvedValue({ id: "skill-1" });
		mocks.deleteAdminSkill.mockResolvedValue({ id: "skill-1" });
	});

	it("checks a session before every admin action", async () => {
		mocks.getServerSession.mockResolvedValue(null);

		await expect(getSkillsAdmin()).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(createSkill(skillInput())).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(updateSkill("skill-1", skillInput())).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		await expect(deleteSkill("skill-1")).resolves.toEqual({ error: { message: "UNAUTHORIZED" } });
		expect(mocks.createAdminSkill).not.toHaveBeenCalled();
	});

	it("lists all skills for an authenticated admin", async () => {
		mocks.getSkillsAdmin.mockResolvedValue([{ icon: null, id: "skill-1", name: "TypeScript" }]);

		await expect(getSkillsAdmin()).resolves.toEqual({
			data: [{ icon: null, id: "skill-1", name: "TypeScript" }],
		});
	});

	it("validates object input and creates a skill", async () => {
		await expect(createSkill(skillInput())).resolves.toEqual({ data: { id: "skill-1" } });
		expect(mocks.createAdminSkill).toHaveBeenCalledWith({ icon: skillIconUrl, name: "TypeScript" });
	});

	it("returns field errors without creating an invalid skill", async () => {
		const result = await createSkill(skillInput({ icon: "", name: "" }));

		expect(result).toEqual({ error: { fields: { icon: "Wajib diisi.", name: "Wajib diisi." } } });
		expect(mocks.createAdminSkill).not.toHaveBeenCalled();
	});

	it("rejects an icon that is not an image URL", async () => {
		const result = await createSkill(skillInput({ icon: "typescript" }));

		expect(result).toEqual({ error: { fields: { icon: "URL ikon tidak valid." } } });
		expect(mocks.createAdminSkill).not.toHaveBeenCalled();
	});

	it("maps a duplicate name to its field", async () => {
		mocks.createAdminSkill.mockResolvedValue("name_taken");

		await expect(createSkill(skillInput())).resolves.toEqual({
			error: { fields: { name: "Nama keahlian sudah digunakan." } },
		});
	});

	it("updates and deletes skills for an authenticated admin", async () => {
		await expect(updateSkill("skill-1", skillInput())).resolves.toEqual({ data: { id: "skill-1" } });
		expect(mocks.updateAdminSkill).toHaveBeenCalledWith("skill-1", { icon: skillIconUrl, name: "TypeScript" });

		await expect(deleteSkill("skill-1")).resolves.toEqual({ data: { id: "skill-1" } });
	});

	it("maps unavailable and duplicate skills to the action contracts", async () => {
		mocks.updateAdminSkill.mockResolvedValue(null);
		mocks.deleteAdminSkill.mockResolvedValue(null);

		await expect(updateSkill("missing", skillInput())).resolves.toEqual({
			error: { fields: { _form: "Keahlian tidak ditemukan." } },
		});
		await expect(deleteSkill("missing")).resolves.toEqual({ error: { message: "Keahlian tidak ditemukan." } });

		mocks.updateAdminSkill.mockResolvedValue("name_taken");
		await expect(updateSkill("skill-1", skillInput())).resolves.toEqual({
			error: { fields: { name: "Nama keahlian sudah digunakan." } },
		});
	});
});
