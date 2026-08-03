"use server";

import {
	createAdminMediaFolder,
	deleteAdminMedia,
	deleteAdminMediaFolder,
	getMediaFolders as getFolders,
	getMediaGalleryPage as getGalleryPage,
	uploadAdminMedia,
} from "@/features/media/media.services";
import type {
	CreateMediaFolderInput,
	CreateMediaFolderResponse,
	MediaFoldersResponse,
	MediaGalleryPageInput,
	MediaGalleryPageResponse,
	MediaMutationResponse,
	MediaUploadResponse,
} from "@/features/media/media.type";
import { requireServerSession } from "@/lib/auth/server-session";
import { toServerActionFailure } from "@/lib/server-action-exception/to-server-action-failure";
import type { ServerActionFailure } from "@/lib/server-action-exception/types";

export async function getMediaGalleryPage(
	input: MediaGalleryPageInput,
): Promise<MediaGalleryPageResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getGalleryPage(input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function getMediaFolders(): Promise<MediaFoldersResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await getFolders() };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function createMediaFolder(
	input: CreateMediaFolderInput,
): Promise<CreateMediaFolderResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await createAdminMediaFolder(input) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function deleteMediaFolder(id: string): Promise<MediaMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await deleteAdminMediaFolder(id) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function uploadMedia(formData: FormData): Promise<MediaUploadResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await uploadAdminMedia(formData) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}

export async function deleteMedia(id: string): Promise<MediaMutationResponse | ServerActionFailure> {
	try {
		await requireServerSession();
		return { data: await deleteAdminMedia(id) };
	} catch (error) {
		return toServerActionFailure(error);
	}
}
