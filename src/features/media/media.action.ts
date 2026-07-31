"use server";

import {
	createMediaFolderSchema,
	mediaFolderIdSchema,
	mediaGalleryPageSchema,
	mediaIdSchema,
	mediaUploadSchema,
} from "@/features/media/media.schema";
import {
	createAdminMediaFolder,
	deleteAdminMedia,
	deleteAdminMediaFolder,
	getMediaFolders as getFolders,
	getMediaGalleryPage as getGalleryPage,
	uploadAdminMedia,
} from "@/features/media/media.services";
import { getServerSession } from "@/lib/auth/server-session";
import { validateWithZod } from "@/lib/validation/zod";

const MEDIA_NOT_FOUND_MESSAGE = "Media tidak ditemukan.";
const MEDIA_UPLOAD_FAILED_MESSAGE = "Gagal mengunggah gambar. Coba lagi.";
const UNAUTHORIZED = { error: { message: "UNAUTHORIZED" } } as const;
type GalleryPageResult = { data: Awaited<ReturnType<typeof getGalleryPage>> } | { error: { message: "UNAUTHORIZED" } };
type FoldersResult = { data: Awaited<ReturnType<typeof getFolders>> } | { error: { message: "UNAUTHORIZED" } };
type CreateFolderResult =
	| { data: { id: string; name: string } }
	| { error: { fields: Record<string, string> } }
	| { error: { message: "UNAUTHORIZED" } };
type DeleteFolderResult =
	| { data: { id: string } }
	| { error: { message: "Folder tidak ditemukan." | "Folder hanya dapat dihapus jika kosong." | "UNAUTHORIZED" } };
type UploadResult =
	| { data: { id: string; url: string } }
	| { error: { fields: Record<string, string> } }
	| { error: { message: "Gagal mengunggah gambar. Coba lagi." | "UNAUTHORIZED" } };
type DeleteResult = { data: { id: string } } | { error: { message: "Media tidak ditemukan." | "UNAUTHORIZED" } };

export async function getMediaGalleryPage(input: unknown): Promise<GalleryPageResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	const validation = validateWithZod(mediaGalleryPageSchema, input);
	const params = validation.success ? validation.data : { folderId: null, page: 1 };
	return { data: await getGalleryPage(params) };
}

export async function getMediaFolders(): Promise<FoldersResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	return { data: await getFolders() };
}

export async function createMediaFolder(data: unknown): Promise<CreateFolderResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	const validation = validateWithZod(createMediaFolderSchema, data);
	if (!validation.success) return { error: { fields: validation.fields } };
	const folder = await createAdminMediaFolder(validation.data);
	return folder === "name_taken" ? { error: { fields: { name: "Nama folder sudah digunakan." } } } : { data: folder };
}

export async function deleteMediaFolder(id: string): Promise<DeleteFolderResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	if (!validateWithZod(mediaFolderIdSchema, id).success) return { error: { message: "Folder tidak ditemukan." } };
	const folder = await deleteAdminMediaFolder(id);
	if (folder === "folder_not_found") return { error: { message: "Folder tidak ditemukan." } };
	if (folder === "folder_not_empty") return { error: { message: "Folder hanya dapat dihapus jika kosong." } };
	return { data: folder };
}

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	const validation = validateWithZod(mediaUploadSchema, {
		file: formData.get("file"),
		folderId: formData.get("folderId") ?? undefined,
	});
	if (!validation.success) return { error: { fields: validation.fields } };

	try {
		const media = await uploadAdminMedia(validation.data);
		return media === "folder_not_found" ? { error: { fields: { folderId: "Folder tidak ditemukan." } } } : { data: media };
	} catch (error) {
		console.error("Media upload failed.", error);
		return { error: { message: MEDIA_UPLOAD_FAILED_MESSAGE } };
	}
}

export async function deleteMedia(id: string): Promise<DeleteResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	if (!validateWithZod(mediaIdSchema, id).success) return { error: { message: MEDIA_NOT_FOUND_MESSAGE } };
	const media = await deleteAdminMedia(id);
	return media ? { data: media } : { error: { message: MEDIA_NOT_FOUND_MESSAGE } };
}
