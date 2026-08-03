import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SkillInput } from "@/features/skills/skills.type";
import { NotFoundException, UnauthorizedException, ValidationException } from "@/lib/server-action-exception/exceptions";

const mocks = vi.hoisted(() => ({
	createAdminSkill: vi.fn(),
	deleteAdminSkill: vi.fn(),
	getSkillsAdmin: vi.fn(),
	requireServerSession: vi.fn(),
	updateAdminSkill: vi.fn(),
}));

vi.mock("@/lib/auth/server-session", () => ({
	requireServerSession: mocks.requireServerSession,
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

function skillInput(values: Partial<SkillInput> = {}): SkillInput {
	return {
		icon: skillIconUrl,
		name: "TypeScript",
		...values,
	};
}

describe("skill admin Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.requireServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });
		mocks.getSkillsAdmin.mockResolvedValue([]);
		mocks.createAdminSkill.mockResolvedValue({ id: "skill-1" });
		mocks.updateAdminSkill.mockResolvedValue({ id: "skill-1" });
		mocks.deleteAdminSkill.mockResolvedValue({ id: "skill-1" });
	});

	it("checks a session before every admin action", async () => {
		mocks.requireServerSession.mockRejectedValue(new UnauthorizedException());

		await expect(getSkillsAdmin()).resolves.toEqual({
			error: { code: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
		});
		await expect(createSkill(skillInput())).resolves.toEqual({
			error: { code: "UNAUTHORIZED", message: "Sesi tidak valid atau telah berakhir." },
		});
		expect(mocks.createAdminSkill).not.toHaveBeenCalled();
	});

	it("forwards authenticated admin requests to the services", async () => {
		await expect(getSkillsAdmin()).resolves.toEqual({ data: [] });
		await expect(createSkill(skillInput())).resolves.toEqual({ data: { id: "skill-1" } });
		expect(mocks.createAdminSkill).toHaveBeenCalledWith(skillInput());

		await expect(updateSkill("skill-1", skillInput())).resolves.toEqual({ data: { id: "skill-1" } });
		expect(mocks.updateAdminSkill).toHaveBeenCalledWith("skill-1", skillInput());

		await expect(deleteSkill("skill-1")).resolves.toEqual({ data: { id: "skill-1" } });
	});

	it("maps validation and not-found errors from services", async () => {
		mocks.createAdminSkill.mockRejectedValue(new ValidationException({ name: "Nama keahlian sudah digunakan." }));
		await expect(createSkill(skillInput())).resolves.toEqual({
			error: {
				code: "VALIDATION_ERROR",
				fields: { name: "Nama keahlian sudah digunakan." },
				message: "Input tidak valid.",
			},
		});

		mocks.deleteAdminSkill.mockRejectedValue(new NotFoundException("Keahlian tidak ditemukan."));
		await expect(deleteSkill("missing")).resolves.toEqual({
			error: { code: "NOT_FOUND", message: "Keahlian tidak ditemukan." },
		});
	});
});
