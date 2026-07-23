import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getContactInfoAdmin: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/features/contact/contact.action", () => ({
	getContactInfoAdmin: mocks.getContactInfoAdmin,
}));

import ContactPage from "@/app/admin/contact/page";

describe("Contact page", () => {
	it("renders the contact information manager", async () => {
		mocks.getContactInfoAdmin.mockResolvedValue({ data: [] });
		const contactPage = render(await ContactPage());

		expect(mocks.getContactInfoAdmin).toHaveBeenCalledOnce();
		expect(contactPage.getByRole("heading", { name: "Contact Info" })).toBeInTheDocument();
		expect(contactPage.getByRole("button", { name: "+ Tambah" })).toBeInTheDocument();
	});
});
