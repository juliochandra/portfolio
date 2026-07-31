/** biome-ignore-all lint/nursery/noSecrets: JSON fixtures do not contain secrets. */
import { describe, expect, it } from "vitest";
import {
	parseRichTextDocument,
	type RichTextDocument,
	richTextDocumentToPlainText,
	serializeRichTextDocument,
} from "@/lib/tiptap/json";
import { renderRichTextDocument } from "@/lib/tiptap/render";

const document: RichTextDocument = {
	content: [
		{
			content: [
				{ text: "Judul", type: "text" },
				{ text: "teks", type: "text" },
			],
			type: "paragraph",
		},
	],
	type: "doc",
};

describe("Tiptap JSON helpers", () => {
	it("serializes, restores, and converts a document to plain text", () => {
		const serializedDocument = serializeRichTextDocument(document);

		expect(parseRichTextDocument(serializedDocument)).toEqual(document);
		expect(richTextDocumentToPlainText(document)).toBe("Judulteks");
	});

	it("rejects a non-document JSON value", () => {
		expect(parseRichTextDocument('{"type":"paragraph"}')).toBeNull();
		expect(parseRichTextDocument("bukan json")).toBeNull();
	});

	it("renders safe HTML from a document", () => {
		expect(renderRichTextDocument(document)).toBe("<p>Judulteks</p>");
	});
});
