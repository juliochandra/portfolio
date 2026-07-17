import { describe, expect, it, vi } from "vitest";
import { type SeedPrismaClient, seedAdminUser } from "../../prisma/seed-logic.ts";

function createFakePrisma(initialCount: number): {
	prisma: SeedPrismaClient;
	created: { username: string; passwordHash: string }[];
} {
	const created: { username: string; passwordHash: string }[] = [];
	const prisma: SeedPrismaClient = {
		user: {
			count: vi.fn(async () => initialCount),
			create: vi.fn(({ data }) => {
				created.push(data);
				return Promise.resolve(data);
			}),
		},
	};
	return { prisma, created };
}

// biome-ignore lint/nursery/noSecrets: test fixtures, not real credentials
describe("seedAdminUser", () => {
	it("creates exactly one admin account when the table is empty", async () => {
		const { prisma, created } = createFakePrisma(0);

		const result = await seedAdminUser(prisma, {
			username: "admin",
			password: "supersecret",
		});

		expect(result).toBe("created");
		expect(created).toHaveLength(1);
		expect(created[0].username).toBe("admin");
		expect(created[0].passwordHash).not.toBe("supersecret");
		expect(created[0].passwordHash).toMatch(/^\$2[aby]\$/);
	});

	it("skips seeding when an account already exists", async () => {
		const { prisma, created } = createFakePrisma(1);

		const result = await seedAdminUser(prisma, {
			username: "admin",
			password: "supersecret",
		});

		expect(result).toBe("skipped");
		expect(created).toHaveLength(0);
	});
});
