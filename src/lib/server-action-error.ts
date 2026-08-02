export type ServerActionFailure = {
	error: {
		code: "CONFLICT" | "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION_ERROR";
		fields?: Record<string, string>;
		message: string;
	};
};

export function validationError(fields: Record<string, string>, message = "Input tidak valid."): ServerActionFailure {
	return {
		error: {
			code: "VALIDATION_ERROR",
			fields,
			message,
		},
	};
}

export function unauthorizedError(message = "Sesi tidak valid atau telah berakhir."): ServerActionFailure {
	return {
		error: {
			code: "UNAUTHORIZED",
			message,
		},
	};
}

export function notFoundError(message = "Data tidak ditemukan."): ServerActionFailure {
	return {
		error: {
			code: "NOT_FOUND",
			message,
		},
	};
}

export function conflictError(message = "Data dengan nilai tersebut sudah digunakan."): ServerActionFailure {
	return {
		error: {
			code: "CONFLICT",
			message,
		},
	};
}
