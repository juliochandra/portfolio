import { describe, expect, it } from "vitest";
import { conflictError, notFoundError, unauthorizedError, validationError } from "@/lib/server-action-error";

describe("Server Action error helpers", () => {
	it("creates a validation error with field errors", () => {
		const fields = { email: "Email tidak valid." };

		expect(validationError(fields)).toEqual({
			error: {
				code: "VALIDATION_ERROR",
				fields,
				message: "Input tidak valid.",
			},
		});
	});

	it.each([
		[conflictError, "CONFLICT"],
		[notFoundError, "NOT_FOUND"],
		[unauthorizedError, "UNAUTHORIZED"],
	] as const)("creates %p with a custom message", (createError, code) => {
		expect(createError("Pesan custom.")).toEqual({
			error: {
				code,
				message: "Pesan custom.",
			},
		});
	});
});
