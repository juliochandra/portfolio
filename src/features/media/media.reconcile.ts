import type { PrismaClient } from "@/generated/prisma/client";

const R2_LIST_PAGE_SIZE = 1000;

export type MediaReconciliationResult = {
	deletedOrphanObjects: number;
	deletedOrphanRecords: number;
};

async function listAllObjectKeys(bucket: R2Bucket): Promise<Set<string>> {
	const keys = new Set<string>();
	let cursor: string | undefined;

	do {
		const page = await bucket.list({ cursor, limit: R2_LIST_PAGE_SIZE });
		for (const object of page.objects) keys.add(object.key);
		cursor = page.truncated ? page.cursor : undefined;
	} while (cursor);

	return keys;
}

/**
 * Reconciles R2 media objects against D1 Media records: deletes R2 objects with no
 * matching record, and deletes records whose R2 object no longer exists.
 */
export async function reconcileMediaStorage(bucket: R2Bucket, prisma: PrismaClient): Promise<MediaReconciliationResult> {
	const [objectKeys, mediaRows] = await Promise.all([
		listAllObjectKeys(bucket),
		prisma.media.findMany({ select: { id: true, objectKey: true } }),
	]);
	const recordedKeys = new Set(mediaRows.map((row) => row.objectKey));

	const orphanObjectKeys = [...objectKeys].filter((key) => !recordedKeys.has(key));
	const orphanRecordIds = mediaRows.filter((row) => !objectKeys.has(row.objectKey)).map((row) => row.id);

	if (orphanObjectKeys.length > 0) {
		await bucket.delete(orphanObjectKeys);
	}
	if (orphanRecordIds.length > 0) {
		await prisma.media.deleteMany({ where: { id: { in: orphanRecordIds } } });
	}

	return { deletedOrphanObjects: orphanObjectKeys.length, deletedOrphanRecords: orphanRecordIds.length };
}
