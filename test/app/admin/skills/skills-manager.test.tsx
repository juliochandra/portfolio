import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createSkill: vi.fn(),
	deleteSkill: vi.fn(),
	refresh: vi.fn(),
	updateSkill: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/features/skills/skills.action", () => ({
	createSkill: mocks.createSkill,
	deleteSkill: mocks.deleteSkill,
	updateSkill: mocks.updateSkill,
}));

import { SkillsManager } from "@/app/admin/skills/_components/SkillsManager";

// biome-ignore lint/nursery/noSecrets: Component name, not a secret.
describe("SkillsManager", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.createSkill.mockResolvedValue({ data: { id: "skill-1" } });
		mocks.updateSkill.mockResolvedValue({ data: { id: "skill-1" } });
		mocks.deleteSkill.mockResolvedValue({ data: { id: "skill-1" } });
	});

	it("shows validation errors without creating an incomplete skill", async () => {
		const manager = render(<SkillsManager initialSkills={[]} />);

		fireEvent.submit(manager.getByRole("button", { name: "+ Tambah" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(manager.getAllByText("Wajib diisi.")).toHaveLength(2);
		});
		expect(mocks.createSkill).not.toHaveBeenCalled();
	});

	it("creates a skill and refreshes the list", async () => {
		const manager = render(<SkillsManager initialSkills={[]} />);
		fireEvent.change(manager.getByRole("textbox", { name: "Nama" }), { target: { value: "TypeScript" } });
		fireEvent.change(manager.getByRole("combobox", { name: "Ikon" }), { target: { value: "typescript" } });

		fireEvent.submit(manager.getByRole("button", { name: "+ Tambah" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(mocks.createSkill).toHaveBeenCalledWith({ icon: "typescript", name: "TypeScript" });
		});
		expect(mocks.refresh).toHaveBeenCalledOnce();
	});

	it("fills the form and updates the selected skill", async () => {
		const manager = render(<SkillsManager initialSkills={[{ icon: "typescript", id: "skill-1", name: "TypeScript" }]} />);

		fireEvent.click(screen.getByRole("button", { name: "Ubah" }));
		expect(manager.getByRole("textbox", { name: "Nama" })).toHaveValue("TypeScript");
		expect(manager.getByRole("button", { name: "Simpan" })).toBeInTheDocument();

		fireEvent.change(manager.getByRole("textbox", { name: "Nama" }), { target: { value: "TypeScript Baru" } });
		fireEvent.submit(manager.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(mocks.updateSkill).toHaveBeenCalledWith("skill-1", { icon: "typescript", name: "TypeScript Baru" });
		});
	});
});
