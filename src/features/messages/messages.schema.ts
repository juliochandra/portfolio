import { z } from "zod";

const REQUIRED_MESSAGE = "Wajib diisi.";

export const sendMessageSchema = z.object({
	email: z.string().trim().min(1, REQUIRED_MESSAGE).max(255, "Maksimal 255 karakter.").email("Format email tidak valid."),
	message: z.string().trim().min(1, REQUIRED_MESSAGE),
	name: z.string().trim().min(1, REQUIRED_MESSAGE).max(100, "Maksimal 100 karakter."),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
