import type { z } from "zod";

export type ZodValidationResult<T> =
	| { data: T; success: true }
	| { fields: Record<string, string>; success: false };

export function validateWithZod<TSchema extends z.ZodType>(
	schema: TSchema,
	input: unknown,
): ZodValidationResult<z.output<TSchema>> {
	const parsed = schema.safeParse(input);
	if (parsed.success) {
		return { data: parsed.data, success: true };
	}

	const fields: Record<string, string> = {};
	for (const issue of parsed.error.issues) {
		const path = issue.path.length > 0 ? issue.path.join(".") : "_form";
		if (!fields[path]) {
			fields[path] = issue.message;
		}
	}

	return { fields, success: false };
}
