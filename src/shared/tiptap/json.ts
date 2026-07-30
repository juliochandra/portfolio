import { generateText, type JSONContent } from "@tiptap/core";
import { createRichTextExtensions } from "@/shared/tiptap/extensions";

export type RichTextDocument = JSONContent & {
	content: JSONContent[];
	type: "doc";
};

export const emptyRichTextDocument: RichTextDocument = {
	content: [{ type: "paragraph" }],
	type: "doc",
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonContent(value: unknown): value is JSONContent {
	if (!isRecord(value) || typeof value.type !== "string") return false;
	if (value.text !== undefined && typeof value.text !== "string") return false;

	if (value.content !== undefined) {
		if (!Array.isArray(value.content) || !value.content.every(isJsonContent)) return false;
	}

	if (value.marks !== undefined) {
		if (!Array.isArray(value.marks)) return false;
		if (!value.marks.every((mark) => isRecord(mark) && typeof mark.type === "string")) return false;
	}

	return true;
}

export function parseRichTextDocument(value: string): RichTextDocument | null {
	try {
		const content: unknown = JSON.parse(value);
		if (!isJsonContent(content) || content.type !== "doc" || !Array.isArray(content.content)) return null;

		return content as RichTextDocument;
	} catch {
		return null;
	}
}

export function serializeRichTextDocument(document: RichTextDocument): string {
	return JSON.stringify(document);
}

export function richTextDocumentToPlainText(document: RichTextDocument): string {
	return generateText(document, createRichTextExtensions()).replace(/\s+/gu, " ").trim();
}

export function hasRichTextContent(document: RichTextDocument): boolean {
	try {
		return Boolean(richTextDocumentToPlainText(document));
	} catch {
		return false;
	}
}
