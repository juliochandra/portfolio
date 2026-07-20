import { expect, test } from "@playwright/test";

test("Blog page shows the hero and post list section", async ({ page }) => {
	await page.goto("/blog");

	await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Semua Tulisan" })).toBeVisible();
});

test("Unavailable blog slug renders the 404 page", async ({ page }) => {
	await page.goto("/blog/tulisan-yang-tidak-ada");

	await expect(page.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeVisible();
});
