import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AdminPage from "@/app/admin/page";

describe("AdminPage", () => {
	it("shows the temporary admin landing page", () => {
		render(<AdminPage />);

		expect(screen.getByRole("heading", { name: "Admin" })).toBeInTheDocument();
		expect(screen.getByText("Anda berhasil masuk.")).toBeInTheDocument();
	});
});
