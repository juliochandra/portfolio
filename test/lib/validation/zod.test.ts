import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validateWithZod } from "@/lib/validation/zod";

// biome-ignore lint/nursery/noSecrets: helper name, not a credential
describe("validateWithZod", () => {
	it("returns parsed data including schema transformations", () => {
		const schema = z.object({ name: z.string().trim() });

		expect(validateWithZod(schema, { name: "  Julio  " })).toEqual({
			data: { name: "Julio" },
			success: true,
		});
	});

	it("maps validation issues to field errors", () => {
		const schema = z.object({
			email: z.email("Alamat email tidak valid."),
			name: z.string().min(1, "Nama wajib diisi."),
		});

		expect(validateWithZod(schema, { email: "invalid", name: "" })).toEqual({
			fields: {
				email: "Alamat email tidak valid.",
				name: "Nama wajib diisi.",
			},
			success: false,
		});
	});

	it("keeps the first issue for the same field", () => {
		const schema = z.object({
			name: z.string().superRefine((_value, context) => {
				context.addIssue({ code: "custom", message: "Error pertama." });
				context.addIssue({ code: "custom", message: "Error kedua." });
			}),
		});

		expect(validateWithZod(schema, { name: "Julio" })).toEqual({
			fields: { name: "Error pertama." },
			success: false,
		});
	});

	it("uses dot notation for nested paths", () => {
		const schema = z.object({
			profile: z.object({ name: z.string().min(1, "Nama wajib diisi.") }),
		});

		expect(validateWithZod(schema, { profile: { name: "" } })).toEqual({
			fields: { "profile.name": "Nama wajib diisi." },
			success: false,
		});
	});

	it("maps pathless issues to the form error key", () => {
		const schema = z.object({ name: z.string() }).refine(() => false, {
			message: "Form tidak valid.",
		});

		expect(validateWithZod(schema, { name: "Julio" })).toEqual({
			fields: { _form: "Form tidak valid." },
			success: false,
		});
	});
});
