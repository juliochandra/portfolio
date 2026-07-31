import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getServerSession: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock("@/features/auth/auth.action", () => ({ login: vi.fn() }));
vi.mock("@/shared/auth/server-session", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect, useRouter: () => ({ replace: vi.fn() }) }));

import LoginPage from "@/app/login/page";

describe("Login page", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("redirects an authenticated visitor to the admin dashboard", async () => {
		mocks.getServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });

		await LoginPage();

		expect(mocks.redirect).toHaveBeenCalledWith("/admin");
	});

	it("renders the standalone dashboard login screen for an unauthenticated visitor", async () => {
		mocks.getServerSession.mockResolvedValue(null);
		const loginPage = render(await LoginPage());

		expect(loginPage.getByText("Personal Dashboard")).toBeInTheDocument();
		expect(loginPage.getByRole("heading", { name: "Login" })).toBeInTheDocument();
		expect(loginPage.getByRole("textbox", { name: "Username" })).toBeInTheDocument();
		expect(loginPage.getByLabelText("Password")).toBeInTheDocument();
		expect(loginPage.getByRole("button", { name: "Login" })).toBeInTheDocument();
	});
});
