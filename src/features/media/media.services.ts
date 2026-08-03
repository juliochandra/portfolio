import { randomUUID } from "node:crypto";
import {
	countMediaGallery,
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
import { createMediaFolderSchema, mediaGalleryPageSchema, mediaUploadSchema } from "@/features/media/media.schema";
import type {
	CreateMediaFolderInput,
	MediaFolder,
	MediaGalleryPage,
	MediaGalleryPageInput,
	MediaUploadInput,
} from "@/features/media/media.type";
import { env } from "@/lib/env";
import {
	ConflictException,
	InternalServerErrorException,
	NotFoundException,
	ValidationException,
} from "@/lib/server-action-exception/exceptions";
import { validateWithZod } from "@/lib/validation/zod";

export const MEDIA_PER_PAGE = 24;

export async function getMediaGalleryPage(params: MediaGalleryPageInput): Promise<MediaGalleryPage> {
	const validation = validateWithZod(mediaGalleryPageSchema, params);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const totalMedia = await countMediaGallery(validation.data.folderId);
	const totalPages = Math.max(1, Math.ceil(totalMedia / MEDIA_PER_PAGE));
	const currentPage = Math.min(validation.data.page, totalPages);
	const media = await findMediaGallery({
		folderId: validation.data.folderId,
		skip: (currentPage - 1) * MEDIA_PER_PAGE,
		take: MEDIA_PER_PAGE,
	});

	return {
		currentPage,
		media: media.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
		totalPages,
	};
}

export async function getMediaFolders(): Promise<MediaFolder[]> {
	const folders = await findMediaFolders();
	return folders.map((folder) => ({ id: folder.id, mediaCount: folder._count.media, name: folder.name }));
}

export async function createAdminMediaFolder(input: CreateMediaFolderInput): Promise<{ id: string; name: string }> {
	const validation = validateWithZod(createMediaFolderSchema, input);
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const existingFolder = await findMediaFolders();
	if (existingFolder.some((folder) => folder.name.toLowerCase() === validation.data.name.toLowerCase())) {
		throw new ValidationException({ name: "Nama folder sudah digunakan." });
	}

	return createMediaFolderRecord(validation.data.name);
}

export async function deleteAdminMediaFolder(id: string): Promise<{ id: string }> {
	const deletedFolder = await deleteEmptyMediaFolderRecord(id);
	if (deletedFolder.count > 0) {
		return { id };
	}

	if (await findMediaFolderById(id)) {
		throw new ConflictException("Folder hanya dapat dihapus jika kosong.");
	}

	throw new NotFoundException("Folder tidak ditemukan.");
}

export async function uploadAdminMedia(formData: FormData): Promise<{ id: string; url: string }> {
	const validation = validateWithZod(mediaUploadSchema, {
		file: formData.get("file"),
		folderId: formData.get("folderId"),
	});
	if (!validation.success) {
		throw new ValidationException(validation.fields);
	}

	const input: MediaUploadInput = validation.data;
	if (input.folderId && !(await findMediaFolderById(input.folderId))) {
		throw new ValidationException({ folderId: "Folder tidak ditemukan." });
	}

	const extension = input.file.type.split("/")[1] === "jpeg" ? "jpg" : input.file.type.split("/")[1];
	const objectKey = `media/${input.folderId ?? "root"}/${randomUUID()}.${extension}`;
	const url = `${env.R2_PUBLIC_URL.replace(/\/$/u, "")}/${objectKey}`;

	try {
		await uploadMediaObject(objectKey, input.file);
		return await createMediaRecord({
			extension,
			fileName: input.file.name,
			folderId: input.folderId,
			mimeType: input.file.type,
			objectKey,
			size: input.file.size,
			url,
		});
	} catch (error) {
		console.error("Media upload failed.", error);
		throw new InternalServerErrorException("Gagal mengunggah gambar. Coba lagi.");
	}
}

export async function deleteAdminMedia(id: string): Promise<{ id: string }> {
	const media = await findMediaForDelete(id);
	if (!media) {
		throw new NotFoundException("Media tidak ditemukan.");
	}
	await deleteMediaObject(media.objectKey);
	return deleteMediaRecord(id);
}
