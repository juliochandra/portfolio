import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import { cache } from "react";

const getPrismaClient = cache(() => {
	const { env } = getCloudflareContext();
	const adapter = new PrismaD1((env as Env).PORTFOLIO_DB);
	return new PrismaClient({ adapter });
});

export const prisma = new Proxy({} as PrismaClient, {
	get(_target, property) {
		return Reflect.get(getPrismaClient(), property);
	},
});
