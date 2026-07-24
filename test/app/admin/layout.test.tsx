import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getServerSession: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock("@/shared/auth/server-session", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("next/navigation", () => ({
	redirect: mocks.redirect,
	usePathname: () => "/admin",
	useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import AdminLayout from "@/app/admin/layout";

describe("AdminLayout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("redirects unauthenticated visitors to login", async () => {
		mocks.getServerSession.mockResolvedValue(null);

		await AdminLayout({ children: <p>Admin</p> });

		expect(mocks.redirect).toHaveBeenCalledWith("/login");
	});

	it("renders the admin layout for an authenticated visitor", async () => {
		mocks.getServerSession.mockResolvedValue({ userId: "user-1", username: "admin" });

		const layout = render(await AdminLayout({ children: <p>Admin</p> }));

		expect(layout.getByText("Admin")).toBeInTheDocument();
	});
});
