import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFoundPage from "@/app/not-found";

// biome-ignore lint/nursery/noSecrets: Nama komponen halaman 404, bukan secret.
describe("NotFoundPage", () => {
	it("renders a clear message and link back to the home page", () => {
		const notFoundPage = render(<NotFoundPage />);

		expect(notFoundPage.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
		expect(notFoundPage.getByRole("link", { name: "Kembali ke Beranda" })).toHaveAttribute("href", "/");
	});
});
