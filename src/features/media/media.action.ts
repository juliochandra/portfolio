"use server";

import { mediaIdSchema, mediaUploadSchema } from "@/features/media/media.schema";
import { deleteAdminMedia, getMediaGallery as getGallery, uploadAdminMedia } from "@/features/media/media.services";
import { getServerSession } from "@/shared/auth/server-session";
import { validateWithZod } from "@/shared/validation/zod";

const MEDIA_NOT_FOUND_MESSAGE = "Media tidak ditemukan.";
const UNAUTHORIZED = { error: { message: "UNAUTHORIZED" } } as const;
type GalleryResult = { data: Awaited<ReturnType<typeof getGallery>> } | { error: { message: "UNAUTHORIZED" } };
type UploadResult =
	| { data: { id: string; url: string } }
	| { error: { fields: Record<string, string> } }
	| { error: { message: "UNAUTHORIZED" } };
type DeleteResult = { data: { id: string } } | { error: { message: "Media tidak ditemukan." | "UNAUTHORIZED" } };

export async function getMediaGallery(): Promise<GalleryResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	return { data: await getGallery() };
}

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	const validation = validateWithZod(mediaUploadSchema, { file: formData.get("file") });
	if (!validation.success) return { error: { fields: validation.fields } };
	return { data: await uploadAdminMedia(validation.data) };
}

export async function deleteMedia(id: string): Promise<DeleteResult> {
	if (!(await getServerSession())) return UNAUTHORIZED;
	if (!validateWithZod(mediaIdSchema, id).success) return { error: { message: MEDIA_NOT_FOUND_MESSAGE } };
	const media = await deleteAdminMedia(id);
	return media ? { data: media } : { error: { message: MEDIA_NOT_FOUND_MESSAGE } };
}
