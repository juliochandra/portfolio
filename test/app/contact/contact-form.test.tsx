import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sendMessage: vi.fn() }));

vi.mock("@/features/messages/messages.action", () => ({ sendMessage: mocks.sendMessage }));

import { ContactForm } from "@/components/contact/ContactForm";

describe("ContactForm", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.sendMessage.mockResolvedValue({ data: { id: "message-1" } });
	});

	it("shows local validation errors before calling the Server Action", async () => {
		const contactForm = render(<ContactForm />);

		fireEvent.submit(contactForm.getByRole("button", { name: "Kirim Pesan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(contactForm.getAllByText("Wajib diisi.")).toHaveLength(3);
		});
		expect(mocks.sendMessage).not.toHaveBeenCalled();
	});

	it("keeps field values and displays Server Action validation errors", async () => {
		mocks.sendMessage.mockResolvedValue({ error: { fields: { email: "Format email tidak valid." } } });
		const contactForm = render(<ContactForm />);

		fireEvent.change(contactForm.getByRole("textbox", { name: "Nama" }), { target: { value: "Julio" } });
		fireEvent.change(contactForm.getByRole("textbox", { name: "Email" }), { target: { value: "julio@example.com" } });
		fireEvent.change(contactForm.getByRole("textbox", { name: "Pesan" }), { target: { value: "Halo" } });
		fireEvent.submit(contactForm.getByRole("button", { name: "Kirim Pesan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(contactForm.getByText("Format email tidak valid.")).toBeInTheDocument();
		});
		expect(contactForm.getByRole("textbox", { name: "Nama" })).toHaveValue("Julio");
	});

	it("submits valid values, clears the form, and confirms success", async () => {
		const contactForm = render(<ContactForm />);

		fireEvent.change(contactForm.getByRole("textbox", { name: "Nama" }), { target: { value: "Julio" } });
		fireEvent.change(contactForm.getByRole("textbox", { name: "Email" }), { target: { value: "julio@example.com" } });
		fireEvent.change(contactForm.getByRole("textbox", { name: "Pesan" }), { target: { value: "Halo" } });
		fireEvent.submit(contactForm.getByRole("button", { name: "Kirim Pesan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(contactForm.getByText("Pesan terkirim. Terima kasih!")).toBeInTheDocument();
		});
		expect(mocks.sendMessage).toHaveBeenCalledWith({ email: "julio@example.com", message: "Halo", name: "Julio" });
		expect(contactForm.getByRole("textbox", { name: "Nama" })).toHaveValue("");
	});
});
