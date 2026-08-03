import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

const iconUrl = "https://cdn.example/skills/typescript.png";
const media = [{ fileName: "typescript.png", folderId: null, id: "media-1", url: iconUrl }];

// biome-ignore lint/nursery/noSecrets: Component name, not a secret.
describe("SkillsManager", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.createSkill.mockResolvedValue({ data: { id: "skill-1" } });
		mocks.updateSkill.mockResolvedValue({ data: { id: "skill-1" } });
		mocks.deleteSkill.mockResolvedValue({ data: { id: "skill-1" } });
	});

	it("shows validation errors returned by the Server Action", async () => {
		mocks.createSkill.mockResolvedValue({
			error: {
				code: "VALIDATION_ERROR",
				fields: { icon: "Wajib diisi.", name: "Wajib diisi." },
				message: "Input tidak valid.",
			},
		});
		const manager = render(<SkillsManager folders={[]} initialSkills={[]} media={[]} />);
		fireEvent.click(manager.getByRole("button", { name: "Tambah Skill" }));
		const dialog = manager.getByRole("dialog", { name: "Tambah Skill" });

		fireEvent.submit(within(dialog).getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(within(dialog).getAllByText("Wajib diisi.")).toHaveLength(2));
		expect(mocks.createSkill).toHaveBeenCalledOnce();
	});

	it("selects an icon from the media modal and creates a skill", async () => {
		const manager = render(<SkillsManager folders={[]} initialSkills={[]} media={media} />);
		fireEvent.click(manager.getByRole("button", { name: "Tambah Skill" }));
		const dialog = manager.getByRole("dialog", { name: "Tambah Skill" });
		fireEvent.change(within(dialog).getByRole("textbox", { name: "Nama skill" }), { target: { value: "TypeScript" } });
		fireEvent.click(within(dialog).getByRole("button", { name: "Pilih ikon" }));

		expect(screen.getByRole("dialog", { name: "Pilih Ikon Keahlian" })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Pilih typescript.png" }));
		expect(within(dialog).getByAltText("Pratinjau ikon keahlian")).toHaveAttribute("src", iconUrl);

		fireEvent.submit(within(dialog).getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(mocks.createSkill).toHaveBeenCalledWith({ icon: iconUrl, name: "TypeScript" }));
		expect(mocks.refresh).toHaveBeenCalledOnce();
	});

	it("sorts skills and filters the compact badge list", () => {
		const manager = render(
			<SkillsManager
				folders={[]}
				initialSkills={[
					{ icon: iconUrl, id: "skill-1", name: "Zod" },
					{ icon: iconUrl, id: "skill-2", name: "React" },
				]}
				media={media}
			/>,
		);

		expect(manager.getByRole("list", { name: "Daftar skill" })).toHaveTextContent("ReactZod");
		fireEvent.change(manager.getByRole("textbox", { name: "Cari skill" }), { target: { value: "react" } });
		expect(manager.getByRole("list", { name: "Daftar skill" })).toHaveTextContent("React");
		expect(manager.queryByText("Zod")).not.toBeInTheDocument();
	});

	it("fills the edit dialog and confirms deletion of a skill", async () => {
		const manager = render(
			<SkillsManager folders={[]} initialSkills={[{ icon: iconUrl, id: "skill-1", name: "TypeScript" }]} media={media} />,
		);

		fireEvent.click(screen.getByRole("button", { name: "TypeScript" }));
		const formDialog = manager.getByRole("dialog", { name: "Ubah Skill" });
		expect(within(formDialog).getByRole("textbox", { name: "Nama skill" })).toHaveValue("TypeScript");

		fireEvent.change(within(formDialog).getByRole("textbox", { name: "Nama skill" }), { target: { value: "React" } });
		fireEvent.submit(within(formDialog).getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(mocks.updateSkill).toHaveBeenCalledWith("skill-1", { icon: iconUrl, name: "React" }));

		fireEvent.click(screen.getByRole("button", { name: "TypeScript" }));
		const deleteFormDialog = manager.getByRole("dialog", { name: "Ubah Skill" });
		fireEvent.click(within(deleteFormDialog).getByRole("button", { name: "Hapus" }));
		const deleteDialog = screen.getByRole("dialog");
		expect(deleteDialog).toHaveTextContent("Skill ini akan dihapus dari daftar keahlian.");
		fireEvent.click(within(deleteDialog).getByRole("button", { name: "Hapus" }));
		await waitFor(() => expect(mocks.deleteSkill).toHaveBeenCalledWith("skill-1"));
	});
});
