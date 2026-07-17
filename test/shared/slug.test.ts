import { describe, expect, it, vi } from "vitest";
import { generateUniqueSlug, slugify } from "@/shared/slug";

describe("slug helpers", () => {
	it("normalizes whitespace, punctuation, and diacritics", () => {
		expect(slugify("  Café & Portfolio!  ")).toBe("cafe-portfolio");
	});

	it("uses a safe fallback for a title without slug characters", () => {
		expect(slugify("***")).toBe("item");
	});

	it("appends the first available suffix for collisions", async () => {
		const isAvailable = vi.fn().mockImplementation((slug: string) => Promise.resolve(slug === "project-3"));

		await expect(generateUniqueSlug("Project", isAvailable)).resolves.toBe("project-3");
		expect(isAvailable).toHaveBeenNthCalledWith(1, "project");
		expect(isAvailable).toHaveBeenNthCalledWith(2, "project-2");
		expect(isAvailable).toHaveBeenNthCalledWith(3, "project-3");
	});
});
