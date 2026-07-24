import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
	test("shows the hero, primary calls to action, and footer", async ({ page }) => {
		await page.goto("/");

		await expect(page.getByRole("main")).toBeVisible();
		await expect(page.getByRole("heading", { level: 1, name: "JULIO." })).toBeVisible();
		await expect(page.getByRole("link", { name: "Lihat Portfolio" })).toHaveAttribute("href", "/portfolio");
		await expect(page.getByRole("link", { name: "Hubungi Saya" }).first()).toHaveAttribute("href", "/contact");
		await expect(page.getByRole("contentinfo")).toBeVisible();
	});

	test("opens the navigation menu on mobile", async ({ page }) => {
		await page.setViewportSize({ height: 844, width: 390 });
		await page.goto("/");

		await page.getByRole("button", { name: "Buka menu" }).click();

		await expect(page.getByRole("button", { name: "Tutup menu" })).toBeVisible();
		await expect(page.getByRole("link", { exact: true, name: "ABOUT" })).toBeVisible();
		await expect(page.getByRole("link", { exact: true, name: "CONTACT" })).toBeVisible();
	});
});
