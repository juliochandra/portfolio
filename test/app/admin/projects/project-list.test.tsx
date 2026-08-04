import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/lib/publish-status";

const mocks = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/features/projects/projects.action", () => ({ deleteProject: vi.fn() }));

import { ProjectList } from "@/components/admin/projects/ProjectList";

describe("ProjectList", () => {
	afterEach(() => cleanup());

	it("renders pagination links for multiple pages", () => {
		const projectList = render(
			<ProjectList
				currentPage={2}
				projects={[{ description: null, id: "project-1", status: PublishStatus.DRAFT, title: "Project" }]}
				totalPages={3}
			/>,
		);

		expect(projectList.getByRole("navigation", { name: "Pagination project" })).toBeInTheDocument();
		expect(projectList.getByRole("link", { name: "Sebelumnya" })).toHaveAttribute("href", "/admin/projects?page=1");
		expect(projectList.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
		expect(projectList.getByRole("link", { name: "Berikutnya" })).toHaveAttribute("href", "/admin/projects?page=3");
	});
});
