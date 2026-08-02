/** biome-ignore-all lint/nursery/noSecrets: exception class name in test fixtures */
import { describe, expect, it } from "vitest";
import {
	ConflictException,
	InternalServerErrorException,
	NotFoundException,
	ServerActionException,
	UnauthorizedException,
	ValidationException,
} from "@/lib/server-action-exception/exceptions";
import { toServerActionFailure } from "@/lib/server-action-exception/to-server-action-failure";

describe("ServerActionException", () => {
	it("stores an application error code and message", () => {
		const exception = new ServerActionException("NOT_FOUND", "Project tidak ditemukan.");

		expect(exception).toBeInstanceOf(Error);
		expect(exception.name).toBe("ServerActionException");
		expect(exception.code).toBe("NOT_FOUND");
		expect(exception.message).toBe("Project tidak ditemukan.");
	});

	it("stores field errors for validation failures", () => {
		const fields = { title: "Judul wajib diisi." };
		const exception = new ValidationException(fields);

		expect(exception).toBeInstanceOf(ServerActionException);
		expect(exception.code).toBe("VALIDATION_ERROR");
		expect(exception.fields).toEqual(fields);
	});

	it.each([
		[ConflictException, "CONFLICT"],
		[InternalServerErrorException, "INTERNAL_SERVER_ERROR"],
		[NotFoundException, "NOT_FOUND"],
		[UnauthorizedException, "UNAUTHORIZED"],
	] as const)("creates %p with the expected error code", (Exception, code) => {
		const exception = new Exception();

		expect(exception).toBeInstanceOf(ServerActionException);
		expect(exception.code).toBe(code);
	});

	it("maps a validation exception to field errors", () => {
		const fields = { title: "Judul wajib diisi." };
		const result = toServerActionFailure(new ValidationException(fields));

		expect(result).toEqual({
			error: {
				code: "VALIDATION_ERROR",
				fields,
				message: "Input tidak valid.",
			},
		});
	});

	it("maps an unauthorized exception to an action failure", () => {
		const result = toServerActionFailure(new UnauthorizedException("UNAUTHORIZED"));

		expect(result).toEqual({
			error: { code: "UNAUTHORIZED", message: "UNAUTHORIZED" },
		});
	});
});
