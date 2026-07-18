import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";
import { env } from "@/shared/env";

const mediaGallerySelect = {
	createdAt: true,
	fileName: true,
	id: true,
	mimeType: true,
	size: true,
	url: true,
} satisfies Prisma.MediaSelect;
const mediaDeleteSelect = { id: true, objectKey: true } satisfies Prisma.MediaSelect;
const mediaMutationSelect = { id: true, url: true } satisfies Prisma.MediaSelect;
const r2 = new S3Client({
	credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
	endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	region: "auto",
});

export type MediaGalleryRecord = Prisma.MediaGetPayload<{ select: typeof mediaGallerySelect }>;
export type MediaDeleteRecord = Prisma.MediaGetPayload<{ select: typeof mediaDeleteSelect }>;

export function findMediaGallery(): Promise<MediaGalleryRecord[]> {
	return prisma.media.findMany({ orderBy: { createdAt: "desc" }, select: mediaGallerySelect });
}

export function findMediaForDelete(id: string): Promise<MediaDeleteRecord | null> {
	return prisma.media.findUnique({ select: mediaDeleteSelect, where: { id } });
}

export async function uploadMediaObject(objectKey: string, file: File): Promise<void> {
	await r2.send(
		new PutObjectCommand({
			Body: Buffer.from(await file.arrayBuffer()),
			Bucket: env.R2_BUCKET_NAME,
			ContentType: file.type,
			Key: objectKey,
		}),
	);
}

export async function deleteMediaObject(objectKey: string): Promise<void> {
	await r2.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: objectKey }));
}

export function createMediaRecord(input: {
	extension: string;
	fileName: string;
	mimeType: string;
	objectKey: string;
	size: number;
	url: string;
}): Promise<{ id: string; url: string }> {
	return prisma.media.create({ data: input, select: mediaMutationSelect });
}

export function deleteMediaRecord(id: string): Promise<{ id: string }> {
	return prisma.media.delete({ select: { id: true }, where: { id } });
}
