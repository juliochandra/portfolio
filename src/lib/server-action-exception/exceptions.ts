import type { ServerActionExceptionCode } from "./types";

export class ServerActionException extends Error {
	readonly code: ServerActionExceptionCode;
	readonly fields?: Record<string, string>;

	constructor(code: ServerActionExceptionCode, message: string, fields?: Record<string, string>) {
		super(message);
		// biome-ignore lint/nursery/noSecrets: exception class name, not a secret
		this.name = "ServerActionException";
		this.code = code;
		this.fields = fields;
	}
}

export class ValidationException extends ServerActionException {
	constructor(fields: Record<string, string>, message = "Input tidak valid.") {
		super("VALIDATION_ERROR", message, fields);
	}
}

export class UnauthorizedException extends ServerActionException {
	constructor(message = "Sesi tidak valid atau telah berakhir.") {
		super("UNAUTHORIZED", message);
	}
}

export class NotFoundException extends ServerActionException {
	constructor(message = "Data tidak ditemukan.") {
		super("NOT_FOUND", message);
	}
}

export class ConflictException extends ServerActionException {
	constructor(message = "Data dengan nilai tersebut sudah digunakan.") {
		super("CONFLICT", message);
	}
}

export class InternalServerErrorException extends ServerActionException {
	constructor(message = "Terjadi kesalahan pada server.") {
		super("INTERNAL_SERVER_ERROR", message);
	}
}
