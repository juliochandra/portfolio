import { describe, expect, it } from "vitest";
import { createAdminSeedData } from "../../prisma/seed-logic.mts";

// biome-ignore lint/nursery/noSecrets: test name, not a secret.
describe("createAdminSeedData", () => {
	it("creates hashed data for the initial admin account", async () => {
		const data = await createAdminSeedData({
			username: "admin",
			password: "supersecret",
		});

		expect(data.username).toBe("admin");
		expect(data.passwordHash).not.toBe("supersecret");
		expect(data.passwordHash).toMatch(/^\$2[aby]\$/);
	});
});
