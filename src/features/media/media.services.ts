import { randomUUID } from "node:crypto";
import {
	createMediaRecord,
	deleteMediaObject,
	deleteMediaRecord,
	findMediaForDelete,
	findMediaGallery,
	uploadMediaObject,
} from "@/features/media/media.repository";
import type { MediaUploadInput } from "@/features/media/media.schema";
import { env } from "@/shared/env";

export type MediaGalleryItem = { createdAt: string; fileName: string; id: string; mimeType: string; size: number; url: string };

export async function getMediaGallery(): Promise<MediaGalleryItem[]> {
	return (await findMediaGallery()).map((media) => ({ ...media, createdAt: media.createdAt.toISOString() }));
}

export async function uploadAdminMedia(input: MediaUploadInput): Promise<{ id: string; url: string }> {
	const extension = input.file.type.split("/")[1] === "jpeg" ? "jpg" : input.file.type.split("/")[1];
	const objectKey = `media/${randomUUID()}.${extension}`;
	const url = `${env.R2_PUBLIC_URL.replace(/\/$/u, "")}/${objectKey}`;
	await uploadMediaObject(objectKey, input.file);
	return createMediaRecord({
		extension,
		fileName: input.file.name,
		mimeType: input.file.type,
		objectKey,
		size: input.file.size,
		url,
	});
}

export async function deleteAdminMedia(id: string): Promise<{ id: string } | null> {
	const media = await findMediaForDelete(id);
	if (!media) return null;
	await deleteMediaObject(media.objectKey);
	return deleteMediaRecord(id);
}
