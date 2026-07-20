import { cleanup, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getContactInfo: vi.fn() }));

vi.mock("@/features/contact/contact.action", () => ({ getContactInfo: mocks.getContactInfo }));
vi.mock("@/features/messages/messages.action", () => ({ sendMessage: vi.fn() }));

import ContactPage from "@/app/(public)/contact/page";

describe("Contact page", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.getContactInfo.mockResolvedValue({
			data: [
				{ icon: "SiMail", id: "contact-1", label: "Email", value: "hello@example.com" },
				{ icon: "SiGithub", id: "contact-2", label: "GitHub", value: "https://github.com/example" },
			],
		});
	});

	it("renders the contact hero, managed contact information, and message form", async () => {
		const contactPage = render(await ContactPage());

		expect(contactPage.getByRole("heading", { name: "Mari Bekerja Sama" })).toBeInTheDocument();
		expect(contactPage.getByRole("link", { name: "Email" })).toHaveAttribute("href", "mailto:hello@example.com");
		expect(contactPage.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/example");
		expect(contactPage.getByRole("button", { name: "Kirim Pesan" })).toBeInTheDocument();
		expect(mocks.getContactInfo).toHaveBeenCalledOnce();
	});

	it("renders the form when contact information is empty", async () => {
		mocks.getContactInfo.mockResolvedValue({ data: [] });

		const contactPage = render(await ContactPage());

		expect(contactPage.getByRole("button", { name: "Kirim Pesan" })).toBeInTheDocument();
		expect(contactPage.getByLabelText("Info kontak")).toBeEmptyDOMElement();
	});
});
