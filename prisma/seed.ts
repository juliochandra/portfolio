import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { env } from "../src/shared/env.ts";
import { seedAdminUser } from "./seed-logic.ts";

async function main(): Promise<void> {
  const seedEnvSchema: z.ZodObject<{
    ADMIN_USERNAME: z.ZodString;
    ADMIN_PASSWORD: z.ZodString;
  }> = z.object({
    ADMIN_USERNAME: z.string().min(1),
    ADMIN_PASSWORD: z.string().min(8),
  });
  const seedEnv = seedEnvSchema.parse(process.env);

  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  try {
    const result = await seedAdminUser(prisma, {
      username: seedEnv.ADMIN_USERNAME,
      password: seedEnv.ADMIN_PASSWORD,
    });
    console.log(
      result === "created"
        ? `Akun admin awal dibuat: ${seedEnv.ADMIN_USERNAME}`
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
