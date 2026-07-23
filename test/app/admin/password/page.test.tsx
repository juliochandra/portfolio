import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/auth.action", () => ({ changePassword: vi.fn() }));

import PasswordPage from "@/app/admin/password/page";

describe("Password page", () => {
	it("renders the password change form", () => {
		const passwordPage = render(<PasswordPage />);

		expect(passwordPage.getByRole("heading", { name: "Password" })).toBeInTheDocument();
		expect(passwordPage.getByLabelText("Kata sandi lama")).toBeInTheDocument();
		expect(passwordPage.getByLabelText("Kata sandi baru")).toBeInTheDocument();
		expect(passwordPage.getByLabelText("Konfirmasi kata sandi baru")).toBeInTheDocument();
		expect(passwordPage.getByRole("button", { name: "Simpan" })).toBeInTheDocument();
	});
});
