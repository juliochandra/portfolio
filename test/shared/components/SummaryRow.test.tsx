import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SummaryRow } from "@/components/admin/SummaryRow";
import { PublishStatus } from "@/lib/publish-status";

describe("SummaryRow", () => {
	it("renders the item metadata and edit destination", () => {
		render(
			<SummaryRow
				createdAt="2026-07-20T00:00:00.000Z"
				href="/admin/posts/post-1"
				labels={["nextjs", "react"]}
				status={PublishStatus.PUBLISHED}
				thumbnailImage={null}
				title="Post terbaru"
			/>,
		);

		expect(screen.getByRole("link", { name: /Post terbaru/ })).toHaveAttribute("href", "/admin/posts/post-1");
		expect(screen.getByText("nextjs")).toBeInTheDocument();
		expect(screen.getByText("PUBLISHED")).toBeInTheDocument();
		expect(screen.getByText("Jul 20, 2026")).toBeInTheDocument();
	});
});
