import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "@/app/(public)/about/page";

describe("About page", () => {
	it("renders the five static About sections", () => {
		const aboutPage = render(<AboutPage />);

		expect(aboutPage.getByRole("heading", { level: 1, name: "JULIO." })).toBeInTheDocument();
		expect(aboutPage.getByRole("heading", { level: 2, name: "Pengembang Web Full-stack" })).toBeInTheDocument();
		expect(aboutPage.getByRole("heading", { name: "Prinsip yang Membimbing Cara Saya Membangun" })).toBeInTheDocument();
		expect(aboutPage.getByRole("heading", { name: "Proses yang Terarah dari Ide hingga Rilis" })).toBeInTheDocument();
		expect(aboutPage.getByRole("heading", { name: "Hal yang Sedang Saya Dalami" })).toBeInTheDocument();
		expect(aboutPage.getByRole("heading", { name: "Lebih dari Sekadar Baris Kode" })).toBeInTheDocument();
	});
});
