import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/auth.action", () => ({ login: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

import LoginPage from "@/app/login/page";

describe("Login page", () => {
	it("renders the standalone dashboard login screen", () => {
		const loginPage = render(<LoginPage />);

		expect(loginPage.getByText("Personal Dashboard")).toBeInTheDocument();
		expect(loginPage.getByRole("heading", { name: "Login" })).toBeInTheDocument();
		expect(loginPage.getByRole("textbox", { name: "Username" })).toBeInTheDocument();
		expect(loginPage.getByLabelText("Password")).toBeInTheDocument();
		expect(loginPage.getByRole("button", { name: "Login" })).toBeInTheDocument();
	});
});
