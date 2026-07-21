import { expect, test } from "@playwright/test";

test("Login page shows the standalone admin form", async ({ page }) => {
	await page.goto("/login");

	await expect(page.getByText("Personal Dashboard")).toBeVisible();
	await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Login" })).toBeVisible();

	await page.getByRole("button", { name: "Login" }).click();

	await expect(page).toHaveURL("/admin");
	await expect(page.getByText("Total Posts")).toBeVisible();
});
