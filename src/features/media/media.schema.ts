import { z } from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const mediaGalleryPageSchema = z.object({
	folderId: z.string().trim().min(1).nullable(),
	page: z.number().int().positive(),
});

const mediaFolderInputSchema = z.object({
	name: z.string().trim().min(1, "Wajib diisi.").max(100),
});

const optionalFolderId = z
	.string()
	.trim()
	.optional()
	.transform((value) => value || null);

export const mediaUploadSchema = z.object({
	file: z
		.instanceof(File, { message: "Berkas wajib diisi." })
		.refine((file) => ACCEPTED_MIME_TYPES.includes(file.type), "Jenis berkas harus JPG, PNG, atau WebP.")
		.refine((file) => file.size <= MAX_FILE_SIZE, "Ukuran berkas maksimal 2MB."),
	folderId: optionalFolderId,
});

export const createMediaFolderSchema = mediaFolderInputSchema;
