import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createContactInfo: vi.fn(),
	deleteContactInfo: vi.fn(),
	refresh: vi.fn(),
	updateContactInfo: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/features/contact/contact.action", () => ({
	createContactInfo: mocks.createContactInfo,
	deleteContactInfo: mocks.deleteContactInfo,
	updateContactInfo: mocks.updateContactInfo,
}));
vi.mock("@/features/media/media.action", () => ({
	getMediaGalleryPage: vi.fn(),
}));

import { ContactInfoManager } from "@/app/admin/contact-info/_components/ContactInfoManager";

// biome-ignore lint/nursery/noSecrets: Component name, not a secret.
describe("ContactInfoManager", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.createContactInfo.mockResolvedValue({ data: { id: "contact-1" } });
		mocks.updateContactInfo.mockResolvedValue({ data: { id: "contact-1" } });
		mocks.deleteContactInfo.mockResolvedValue({ data: { id: "contact-1" } });
	});

	it("shows validation errors without creating an incomplete contact", async () => {
		const manager = render(<ContactInfoManager initialContacts={[]} />);
		fireEvent.click(manager.getByRole("button", { name: "Tambah Contact" }));
		const dialog = manager.getByRole("dialog", { name: "Tambah Contact Info" });

		fireEvent.submit(within(dialog).getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(within(dialog).getAllByText("Wajib diisi.")).toHaveLength(2);
		});
		expect(mocks.createContactInfo).not.toHaveBeenCalled();
	});

	it("creates contact information without requiring an icon", async () => {
		const manager = render(<ContactInfoManager initialContacts={[]} />);
		fireEvent.click(manager.getByRole("button", { name: "Tambah Contact" }));
		const dialog = manager.getByRole("dialog", { name: "Tambah Contact Info" });
		fireEvent.change(within(dialog).getByRole("textbox", { name: "Label" }), { target: { value: "Email" } });
		fireEvent.change(within(dialog).getByRole("textbox", { name: "URL" }), { target: { value: "mailto:hello@example.com" } });

		fireEvent.submit(within(dialog).getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(mocks.createContactInfo).toHaveBeenCalledWith({ icon: "", label: "Email", value: "mailto:hello@example.com" });
		});
		expect(mocks.refresh).toHaveBeenCalledOnce();
	});

	it("selects a contact icon from the Media gallery", async () => {
		const iconUrl = "https://cdn.example.com/icons/email.png";
		const manager = render(
			<ContactInfoManager
				initialContacts={[]}
				media={[{ fileName: "email.png", folderId: null, id: "media-1", url: iconUrl }]}
			/>,
		);
		fireEvent.click(manager.getByRole("button", { name: "Tambah Contact" }));
		const dialog = manager.getByRole("dialog", { name: "Tambah Contact Info" });
		fireEvent.change(within(dialog).getByRole("textbox", { name: "Label" }), { target: { value: "Email" } });
		fireEvent.change(within(dialog).getByRole("textbox", { name: "URL" }), { target: { value: "mailto:hello@example.com" } });

		fireEvent.click(within(dialog).getByRole("button", { name: "Pilih ikon" }));
		fireEvent.click(screen.getByRole("button", { name: "Pilih email.png" }));
		fireEvent.submit(within(dialog).getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(mocks.createContactInfo).toHaveBeenCalledWith({
				icon: iconUrl,
				label: "Email",
				value: "mailto:hello@example.com",
			});
		});
	});

	it("fills the form, updates, and deletes the selected contact", async () => {
		const manager = render(
			<ContactInfoManager
				initialContacts={[{ icon: "simail", id: "contact-1", label: "Email", value: "mailto:hello@example.com" }]}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Email" }));
		const formDialog = manager.getByRole("dialog", { name: "Ubah Contact Info" });
		expect(within(formDialog).getByRole("textbox", { name: "Label" })).toHaveValue("Email");

		fireEvent.change(within(formDialog).getByRole("textbox", { name: "URL" }), {
			target: { value: "mailto:new@example.com" },
		});
		fireEvent.submit(within(formDialog).getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(mocks.updateContactInfo).toHaveBeenCalledWith("contact-1", {
				icon: "simail",
				label: "Email",
				value: "mailto:new@example.com",
			});
		});

		fireEvent.click(screen.getByRole("button", { name: "Email" }));
		const deleteFormDialog = manager.getByRole("dialog", { name: "Ubah Contact Info" });
		fireEvent.click(within(deleteFormDialog).getByRole("button", { name: "Hapus" }));
		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Hapus" }));
		await waitFor(() => expect(mocks.deleteContactInfo).toHaveBeenCalledWith("contact-1"));
	});
});
