import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	changePassword: vi.fn(),
}));

vi.mock("@/features/auth/auth.action", () => ({ changePassword: mocks.changePassword }));

import { PasswordForm } from "@/app/admin/password/_components/PasswordForm";

// biome-ignore lint/nursery/noSecrets: Component name, not a secret.
describe("PasswordForm", () => {
	beforeEach(() => {
		cleanup();
		vi.clearAllMocks();
		mocks.changePassword.mockResolvedValue({ data: { success: true } });
	});

	it("changes the password and clears every field after success", async () => {
		const passwordForm = render(<PasswordForm />);

		fillPasswordFields(passwordForm, "old-password", "new-password", "new-password");
		fireEvent.submit(passwordForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => {
			expect(mocks.changePassword).toHaveBeenCalledWith({
				confirmPassword: "new-password",
				newPassword: "new-password",
				oldPassword: "old-password",
			});
		});
		expect(passwordForm.getByText("Kata sandi berhasil diganti.")).toBeInTheDocument();
		expect(passwordForm.getByLabelText("Kata sandi lama")).toHaveValue("");
		expect(passwordForm.getByLabelText("Kata sandi baru")).toHaveValue("");
		expect(passwordForm.getByLabelText("Konfirmasi kata sandi baru")).toHaveValue("");
	});

	it("shows server field errors without clearing the inputs", async () => {
		mocks.changePassword.mockResolvedValue({ error: { fields: { oldPassword: "Kata sandi lama tidak cocok." } } });
		const passwordForm = render(<PasswordForm />);

		fillPasswordFields(passwordForm, "wrong-password", "new-password", "new-password");
		fireEvent.submit(passwordForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(passwordForm.getByText("Kata sandi lama tidak cocok.")).toBeInTheDocument());
		expect(passwordForm.getByLabelText("Kata sandi lama")).toHaveValue("wrong-password");
		expect(passwordForm.getByLabelText("Kata sandi lama")).toHaveClass("border-danger");
		expect(passwordForm.getByLabelText("Kata sandi baru")).toHaveValue("new-password");
		expect(passwordForm.getByLabelText("Konfirmasi kata sandi baru")).toHaveValue("new-password");
	});

	it("shows a confirmation error before calling the Server Action", async () => {
		const passwordForm = render(<PasswordForm />);

		fillPasswordFields(passwordForm, "old-password", "new-password", "different-password");
		fireEvent.submit(passwordForm.getByRole("button", { name: "Simpan" }).closest("form") as HTMLFormElement);

		await waitFor(() => expect(passwordForm.getByText("Konfirmasi kata sandi tidak cocok.")).toBeInTheDocument());
		expect(mocks.changePassword).not.toHaveBeenCalled();
	});

	it("toggles password visibility without changing its value", () => {
		const passwordForm = render(<PasswordForm />);
		const oldPasswordInput = passwordForm.getByLabelText("Kata sandi lama");

		fireEvent.change(oldPasswordInput, { target: { value: "old-password" } });
		fireEvent.click(passwordForm.getByRole("button", { name: "Lihat kata sandi lama" }));

		expect(passwordForm.getByLabelText("Kata sandi lama")).toHaveAttribute("type", "text");
		expect(passwordForm.getByLabelText("Kata sandi lama")).toHaveValue("old-password");
	});
});

function fillPasswordFields(
	passwordForm: ReturnType<typeof render>,
	oldPassword: string,
	newPassword: string,
	confirmPassword: string,
) {
	fireEvent.change(passwordForm.getByLabelText("Kata sandi lama"), { target: { value: oldPassword } });
	fireEvent.change(passwordForm.getByLabelText("Kata sandi baru"), { target: { value: newPassword } });
	fireEvent.change(passwordForm.getByLabelText("Konfirmasi kata sandi baru"), { target: { value: confirmPassword } });
}
