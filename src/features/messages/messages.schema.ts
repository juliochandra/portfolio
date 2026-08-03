import { z } from "zod";

export const sendMessageSchema = z.object({
	email: z.string().trim().min(1, "Wajib diisi.").max(255, "Maksimal 255 karakter.").email("Format email tidak valid."),
	message: z.string().trim().min(1, "Wajib diisi."),
	name: z.string().trim().min(1, "Wajib diisi.").max(100, "Maksimal 100 karakter."),
});

export const adminMessagesPageSchema = z.object({
	page: z.number().int().positive(),
	tab: z.enum(["aktif", "arsip"]),
});
