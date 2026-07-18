import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Page from "@/app/(public)/page";

describe("Home page", () => {
	it("renders without crashing", () => {
		render(<Page />);
		expect(screen.getByRole("main")).toBeInTheDocument();
	});
});
