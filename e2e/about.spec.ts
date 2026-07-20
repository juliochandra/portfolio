import { expect, test } from "@playwright/test";

test("About page shows the static profile and sections", async ({ page }) => {
	await page.goto("/about");

	await expect(page.getByRole("heading", { level: 1, name: "JULIO." })).toBeVisible();
	await expect(page.getByRole("heading", { level: 2, name: "Pengembang Web Full-stack" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Prinsip yang Membimbing Cara Saya Membangun" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Proses yang Terarah dari Ide hingga Rilis" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Hal yang Sedang Saya Dalami" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Lebih dari Sekadar Baris Kode" })).toBeVisible();
});
