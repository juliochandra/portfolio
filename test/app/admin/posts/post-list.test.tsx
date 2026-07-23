import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublishStatus } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/features/posts/posts.action", () => ({ deletePost: vi.fn() }));

import { PostList } from "@/app/admin/posts/_components/PostList";

describe("PostList", () => {
	afterEach(() => cleanup());

	it("renders pagination links for multiple pages", () => {
		const postList = render(
			<PostList
				currentPage={2}
				posts={[{ createdAt: "2026-07-16T10:00:00.000Z", id: "post-1", status: PublishStatus.DRAFT, title: "Tulisan" }]}
				totalPages={3}
			/>,
		);

		expect(postList.getByRole("navigation", { name: "Pagination tulisan" })).toBeInTheDocument();
		expect(postList.getByRole("link", { name: "Sebelumnya" })).toHaveAttribute("href", "/admin/posts?page=1");
		expect(postList.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
		expect(postList.getByRole("link", { name: "Berikutnya" })).toHaveAttribute("href", "/admin/posts?page=3");
	});
});
