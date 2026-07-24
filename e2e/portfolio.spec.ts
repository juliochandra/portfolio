import { expect, test } from "@playwright/test";

test("Portfolio page shows the hero and project list section", async ({ page }) => {
	await page.goto("/portfolio");

	await expect(page.getByRole("heading", { level: 1, name: "Portfolio" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Semua Project" })).toBeVisible();
});

test("Unavailable portfolio slug renders the 404 page", async ({ page }) => {
	await page.goto("/portfolio/project-yang-tidak-ada");

	await expect(page.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeVisible();
});
