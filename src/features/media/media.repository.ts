import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/database/prisma";
import { env } from "@/shared/env";

const mediaGallerySelect = {
	createdAt: true,
	fileName: true,
	folderId: true,
	id: true,
	mimeType: true,
	size: true,
	url: true,
} satisfies Prisma.MediaSelect;
const mediaDeleteSelect = { id: true, objectKey: true } satisfies Prisma.MediaSelect;
const mediaMutationSelect = { id: true, url: true } satisfies Prisma.MediaSelect;
const mediaFolderSelect = { id: true, name: true } satisfies Prisma.MediaFolderSelect;
const mediaFolderListSelect = {
	...mediaFolderSelect,
	_count: { select: { media: true } },
} satisfies Prisma.MediaFolderSelect;
const r2 = new S3Client({
	credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
	endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	region: "auto",
});

export type MediaGalleryRecord = Prisma.MediaGetPayload<{ select: typeof mediaGallerySelect }>;
export type MediaDeleteRecord = Prisma.MediaGetPayload<{ select: typeof mediaDeleteSelect }>;
export type MediaFolderRecord = Prisma.MediaFolderGetPayload<{ select: typeof mediaFolderSelect }>;
export type MediaFolderListRecord = Prisma.MediaFolderGetPayload<{ select: typeof mediaFolderListSelect }>;

export function countMediaGallery(folderId: string | null): Promise<number> {
	return prisma.media.count({ where: { folderId } });
}

export function findMediaGallery(params: {
	folderId: string | null;
	skip: number;
	take: number;
}): Promise<MediaGalleryRecord[]> {
	return prisma.media.findMany({
		orderBy: [{ fileName: "asc" }, { createdAt: "desc" }],
		select: mediaGallerySelect,
		skip: params.skip,
		take: params.take,
		where: { folderId: params.folderId },
	});
}

export function findMediaForDelete(id: string): Promise<MediaDeleteRecord | null> {
	return prisma.media.findUnique({ select: mediaDeleteSelect, where: { id } });
}

export function findMediaFolders(): Promise<MediaFolderListRecord[]> {
	return prisma.mediaFolder.findMany({ orderBy: { name: "asc" }, select: mediaFolderListSelect });
}

export function findMediaFolderById(id: string): Promise<{ id: string } | null> {
	return prisma.mediaFolder.findUnique({ select: { id: true }, where: { id } });
}

export function createMediaFolderRecord(name: string): Promise<{ id: string; name: string }> {
	return prisma.mediaFolder.create({ data: { name }, select: mediaFolderSelect });
}

export function deleteEmptyMediaFolderRecord(id: string): Promise<{ count: number }> {
	return prisma.mediaFolder.deleteMany({ where: { id, media: { none: {} } } });
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
	folderId: string | null;
	size: number;
	url: string;
}): Promise<{ id: string; url: string }> {
	return prisma.media.create({
		data: {
			extension: input.extension,
			fileName: input.fileName,
			folder: input.folderId ? { connect: { id: input.folderId } } : undefined,
			mimeType: input.mimeType,
			objectKey: input.objectKey,
			size: input.size,
			url: input.url,
		},
		select: mediaMutationSelect,
	});
}

export function deleteMediaRecord(id: string): Promise<{ id: string }> {
	return prisma.media.delete({ select: { id: true }, where: { id } });
}
