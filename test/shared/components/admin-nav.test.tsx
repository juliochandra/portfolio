import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	logout: vi.fn(),
	push: vi.fn(),
	refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	usePathname: () => "/admin",
	useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock("@/features/auth/auth.action", () => ({ logout: mocks.logout }));
vi.mock("@/shared/components/ThemeToggle", () => ({
	ThemeToggle: () => <button type="button">Tema</button>,
}));

import { AdminNav } from "@/shared/components/AdminNav";

describe("AdminNav", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.logout.mockResolvedValue(undefined);
	});

	afterEach(() => cleanup());

	it("places theme and logout controls in the System group", () => {
		const navigation = render(<AdminNav />);

		expect(navigation.getByText("System")).toBeInTheDocument();
		expect(navigation.getByRole("link", { name: "Password" })).toBeInTheDocument();
		expect(navigation.getByRole("button", { name: "Tema" })).toBeInTheDocument();
		expect(navigation.getAllByRole("button", { name: "Keluar" })).toHaveLength(1);
	});

	it("logs out from the System group", async () => {
		const navigation = render(<AdminNav />);
		fireEvent.click(navigation.getByRole("button", { name: "Keluar" }));
		const dialog = navigation.getByRole("dialog");

		expect(dialog).toHaveTextContent("Apakah Anda yakin ingin keluar?");
		expect(mocks.logout).not.toHaveBeenCalled();
		fireEvent.click(within(dialog).getByRole("button", { name: "Keluar" }));

		await waitFor(() => expect(mocks.logout).toHaveBeenCalledOnce());
		expect(mocks.push).toHaveBeenCalledWith("/login");
		expect(mocks.refresh).toHaveBeenCalledOnce();
	});
});
