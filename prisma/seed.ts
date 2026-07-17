import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { env } from "../src/shared/env.ts";
import { seedAdminUser } from "./seed-logic.ts";

async function main(): Promise<void> {
	const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
	const prisma = new PrismaClient({ adapter });
	try {
		const result = await seedAdminUser(prisma, {
			username: env.ADMIN_USERNAME,
			password: env.ADMIN_PASSWORD,
		});
		console.log(
			result === "created"
				? `Akun admin awal dibuat: ${env.ADMIN_USERNAME}`
				: "Akun admin sudah ada, seed dilewati.",
		);
	} finally {
		await prisma.$disconnect();
	}
}

main().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
