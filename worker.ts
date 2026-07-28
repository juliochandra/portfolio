import { PrismaD1 } from "@prisma/adapter-d1";
import { reconcileMediaStorage } from "@/features/media/media.reconcile";
import { PrismaClient } from "@/generated/prisma/client";
// @ts-expect-error `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";

async function runMediaReconciliation(env: Env): Promise<void> {
	const prisma = new PrismaClient({ adapter: new PrismaD1(env.portfolio_db) });
	try {
		const result = await reconcileMediaStorage(env.PORTFOLIO_MEDIA, prisma);
		console.log("Media reconciliation done.", result);
	} catch (error) {
		console.error("Media reconciliation failed.", error);
	} finally {
		await prisma.$disconnect();
	}
}

export default {
	fetch: handler.fetch,
	scheduled(_event, env, ctx) {
		ctx.waitUntil(runMediaReconciliation(env));
	},
} satisfies ExportedHandler<Env>;
