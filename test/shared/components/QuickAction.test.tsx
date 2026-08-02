import { render, screen } from "@testing-library/react";
import { FaFileLines } from "react-icons/fa6";
import { describe, expect, it } from "vitest";
import { QuickAction } from "@/components/admin/QuickAction";

describe("QuickAction", () => {
	it("renders a navigation link with its description", () => {
		render(<QuickAction description="Create a new blog post" href="/admin/posts/new" icon={FaFileLines} label="New Post" />);

		expect(screen.getByRole("link", { name: "New Post" })).toHaveAttribute("href", "/admin/posts/new");
		expect(screen.getByText("Create a new blog post")).toBeInTheDocument();
	});
});
