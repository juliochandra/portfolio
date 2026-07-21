import { expect, test } from "@playwright/test";

test("Contact page shows managed contact information and message form", async ({ page }) => {
	await page.goto("/contact");

	await expect(page.getByRole("heading", { name: "Mari Bekerja Sama" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Kirim Pesan" })).toBeVisible();
});
