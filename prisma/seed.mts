import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getPlatformProxy } from "wrangler";
import { z } from "zod";
import { PrismaClient } from "../src/generated/prisma/client";
import { createAdminSeedData } from "./seed-logic.mts";

const seedEnv = z
	.object({
		ADMIN_PASSWORD: z.string().min(8),
		ADMIN_USERNAME: z.string().min(1),
	})
	.parse(process.env);

async function main(): Promise<void> {
	const data = await createAdminSeedData({
		username: seedEnv.ADMIN_USERNAME,
		password: seedEnv.ADMIN_PASSWORD,
	});
	const { env, dispose } = await getPlatformProxy<Env>();
	const prisma = new PrismaClient({ adapter: new PrismaD1(env.portfolio_db) });

	try {
		await prisma.user.upsert({
			where: { username: data.username },
			update: {},
			create: { id: randomUUID(), passwordHash: data.passwordHash, username: data.username },
		});
	} finally {
		await prisma.$disconnect();
		await dispose();
	}
	console.log(`Seed admin selesai untuk: ${seedEnv.ADMIN_USERNAME} (D1 lokal)`);
}

main().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
