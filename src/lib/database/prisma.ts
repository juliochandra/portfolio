import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
	const { env } = getCloudflareContext();
	return new PrismaClient({ adapter: new PrismaD1((env as Env).portfolio_db) });
}

function resolvePrisma(): PrismaClient {
	globalForPrisma.prisma ??= createPrismaClient();
	return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
	get: (_target, prop, receiver) => Reflect.get(resolvePrisma() as object, prop, receiver),
});
