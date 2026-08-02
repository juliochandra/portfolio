export type ServerActionExceptionCode =
	| "CONFLICT"
	| "INTERNAL_SERVER_ERROR"
	| "NOT_FOUND"
	| "UNAUTHORIZED"
	| "VALIDATION_ERROR";

export type ServerActionFailure = {
	error: {
		code: ServerActionExceptionCode;
		fields?: Record<string, string>;
		message: string;
	};
};
