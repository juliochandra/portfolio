import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import { sanitizeRichText } from "@/shared/rich-text";
import { createRichTextExtensions } from "@/shared/tiptap/extensions";
import type { RichTextDocument } from "@/shared/tiptap/json";

export function renderRichTextDocument(document: RichTextDocument): string {
	const html = renderToHTMLString({ content: document, extensions: createRichTextExtensions() });
	return sanitizeRichText(html);
}
