import { randomUUID } from "node:crypto";
import {
	createMediaFolderRecord,
	createMediaRecord,
	deleteEmptyMediaFolderRecord,
	deleteMediaObject,
	deleteMediaRecord,
	findMediaFolderById,
	findMediaFolders,
	findMediaForDelete,
	findMediaGallery,
	uploadMediaObject,
} from "@/features/media/media.repository";
import type { CreateMediaFolderInput, MediaUploadInput } from "@/features/media/media.schema";
import { env } from "@/shared/env";

export type MediaGalleryItem = {
	createdAt: string;
	fileName: string;
	folderId: string | null;
	id: string;
	mimeType: string;
	size: number;
	url: string;
};

export type MediaFolder = { id: string; name: string };

export async function getMediaGallery(): Promise<MediaGalleryItem[]> {
	return (await findMediaGallery()).map((media) => ({ ...media, createdAt: media.createdAt.toISOString() }));
}

export function getMediaFolders(): Promise<MediaFolder[]> {
	return findMediaFolders();
}

export async function createAdminMediaFolder(
	input: CreateMediaFolderInput,
): Promise<{ id: string; name: string } | "name_taken"> {
	const existingFolder = await findMediaFolders();
	if (existingFolder.some((folder) => folder.name.toLowerCase() === input.name.toLowerCase())) {
		return "name_taken";
	}

	return createMediaFolderRecord(input.name);
}

export async function deleteAdminMediaFolder(id: string): Promise<{ id: string } | "folder_not_empty" | "folder_not_found"> {
	const deletedFolder = await deleteEmptyMediaFolderRecord(id);
	if (deletedFolder.count > 0) {
		return { id };
	}

	return (await findMediaFolderById(id)) ? "folder_not_empty" : "folder_not_found";
}

export async function uploadAdminMedia(input: MediaUploadInput): Promise<{ id: string; url: string } | "folder_not_found"> {
	if (input.folderId && !(await findMediaFolderById(input.folderId))) {
		return "folder_not_found";
	}

	const extension = input.file.type.split("/")[1] === "jpeg" ? "jpg" : input.file.type.split("/")[1];
	const objectKey = `media/${input.folderId ?? "root"}/${randomUUID()}.${extension}`;
	const url = `${env.R2_PUBLIC_URL.replace(/\/$/u, "")}/${objectKey}`;
	await uploadMediaObject(objectKey, input.file);
	return createMediaRecord({
		extension,
		fileName: input.file.name,
		folderId: input.folderId,
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
