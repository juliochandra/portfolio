import { describe, expect, it, vi } from "vitest";
import { reconcileMediaStorage } from "@/features/media/media.reconcile";

function fakeBucket(keys: string[]) {
	return {
		list: vi.fn().mockResolvedValue({ objects: keys.map((key) => ({ key })), truncated: false }),
		delete: vi.fn().mockResolvedValue(undefined),
	};
}

function fakePrisma(rows: { id: string; objectKey: string }[]) {
	return {
		media: {
			findMany: vi.fn().mockResolvedValue(rows),
			deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
		},
	};
}

// biome-ignore lint/nursery/noSecrets: function name, not a credential
describe("reconcileMediaStorage", () => {
	it("deletes R2 objects with no matching Media record", async () => {
		const bucket = fakeBucket(["media/a.png", "media/orphan.png"]);
		const prisma = fakePrisma([{ id: "1", objectKey: "media/a.png" }]);

		const result = await reconcileMediaStorage(bucket as never, prisma as never);

		expect(bucket.delete).toHaveBeenCalledWith(["media/orphan.png"]);
		expect(result.deletedOrphanObjects).toBe(1);
	});

	it("deletes Media records whose R2 object no longer exists", async () => {
		const bucket = fakeBucket(["media/a.png"]);
		const prisma = fakePrisma([
			{ id: "1", objectKey: "media/a.png" },
			{ id: "2", objectKey: "media/missing.png" },
		]);

		const result = await reconcileMediaStorage(bucket as never, prisma as never);

		expect(prisma.media.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ["2"] } } });
		expect(result.deletedOrphanRecords).toBe(1);
	});

	it("does nothing when R2 and D1 are already in sync", async () => {
		const bucket = fakeBucket(["media/a.png"]);
		const prisma = fakePrisma([{ id: "1", objectKey: "media/a.png" }]);

		const result = await reconcileMediaStorage(bucket as never, prisma as never);

		expect(bucket.delete).not.toHaveBeenCalled();
		expect(prisma.media.deleteMany).not.toHaveBeenCalled();
		expect(result).toEqual({ deletedOrphanObjects: 0, deletedOrphanRecords: 0 });
	});

	it("paginates through R2 list results via cursor", async () => {
		const bucket = {
			list: vi
				.fn()
				.mockResolvedValueOnce({ objects: [{ key: "media/a.png" }], truncated: true, cursor: "next" })
				.mockResolvedValueOnce({ objects: [{ key: "media/b.png" }], truncated: false }),
			delete: vi.fn().mockResolvedValue(undefined),
		};
		const prisma = fakePrisma([
			{ id: "1", objectKey: "media/a.png" },
			{ id: "2", objectKey: "media/b.png" },
		]);

		const result = await reconcileMediaStorage(bucket as never, prisma as never);

		expect(bucket.list).toHaveBeenCalledTimes(2);
		expect(bucket.list).toHaveBeenNthCalledWith(2, expect.objectContaining({ cursor: "next" }));
		expect(result).toEqual({ deletedOrphanObjects: 0, deletedOrphanRecords: 0 });
	});
});
