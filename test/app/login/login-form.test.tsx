import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	login: vi.fn(),
	replace: vi.fn(),
}));

vi.mock("@/features/auth/auth.action", () => ({ login: mocks.login }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));

import { LoginForm } from "@/app/login/_components/LoginForm";

describe("LoginForm", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.login.mockResolvedValue({ data: { username: "admin" } });
	});

	it("shows temporary credentials for easier local login", () => {
		const loginForm = render(<LoginForm />);

		expect(loginForm.getByRole("textbox", { name: "Username" })).toHaveValue("admin");
		expect(loginForm.getByLabelText("Password")).toHaveValue("change-me-after-first-login");
	});

	it("shows a generic error before calling the Server Action when credentials are empty", async () => {
		const loginForm = render(<LoginForm />);
		fireEvent.change(loginForm.getByRole("textbox", { name: "Username" }), { target: { value: "" } });
		fireEvent.change(loginForm.getByLabelText("Password"), { target: { value: "" } });

		fireEvent.submit(loginForm.getByRole("button", { name: "Login" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(loginForm.getByText("Data masuk keliru. Periksa kembali.")).toBeInTheDocument();
		});
		expect(mocks.login).not.toHaveBeenCalled();
	});

	it("keeps credentials and displays a generic error when login fails", async () => {
		mocks.login.mockResolvedValue({ error: { message: "Username atau kata sandi salah." } });
		const loginForm = render(<LoginForm />);

		fireEvent.change(loginForm.getByRole("textbox", { name: "Username" }), { target: { value: "admin" } });
		fireEvent.change(loginForm.getByLabelText("Password"), { target: { value: "wrong-password" } });
		fireEvent.submit(loginForm.getByRole("button", { name: "Login" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(loginForm.getByText("Data masuk keliru. Periksa kembali.")).toBeInTheDocument();
		});
		expect(loginForm.getByRole("textbox", { name: "Username" })).toHaveValue("admin");
		expect(loginForm.getByLabelText("Password")).toHaveValue("wrong-password");
	});

	it("redirects to the dashboard after a successful login", async () => {
		const loginForm = render(<LoginForm />);

		fireEvent.change(loginForm.getByRole("textbox", { name: "Username" }), { target: { value: "admin" } });
		fireEvent.change(loginForm.getByLabelText("Password"), { target: { value: "correct-password" } });
		fireEvent.submit(loginForm.getByRole("button", { name: "Login" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(mocks.login).toHaveBeenCalledWith({ password: "correct-password", username: "admin" });
		});
		expect(mocks.replace).toHaveBeenCalledWith("/admin");
	});

	it("toggles password visibility without changing its value", () => {
		const loginForm = render(<LoginForm />);
		const passwordInput = loginForm.getByLabelText("Password");

		fireEvent.change(passwordInput, { target: { value: "secret" } });
		expect(passwordInput).toHaveAttribute("type", "password");
		fireEvent.click(loginForm.getByRole("button", { name: "Lihat password" }));
		expect(loginForm.getByLabelText("Password")).toHaveAttribute("type", "text");
		expect(loginForm.getByLabelText("Password")).toHaveValue("secret");
	});
});
