import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusSelect } from "@/shared/components/StatusSelect";

// biome-ignore lint/nursery/noSecrets: component name
describe("StatusSelect", () => {
	it("renders every project publication status", () => {
		render(<StatusSelect aria-label="Status" name="status" />);

		expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue("DRAFT");
		expect(screen.getByRole("option", { name: "Draft" })).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "Published" })).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "Archived" })).toBeInTheDocument();
	});
});
