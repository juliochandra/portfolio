import { ServerActionException } from "./exceptions";
import type { ServerActionFailure } from "./types";

export function toServerActionFailure(error: unknown): ServerActionFailure {
	if (error instanceof ServerActionException) {
		return {
			error: {
				code: error.code,
				...(error.fields ? { fields: error.fields } : {}),
				message: error.message,
			},
		};
	}

	console.error("Server Action gagal:", error);
	return { error: { code: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan pada server." } };
}
