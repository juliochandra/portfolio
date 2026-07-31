import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import { sanitizeRichText } from "@/lib/rich-text";
import { createRichTextExtensions } from "@/lib/tiptap/extensions";
import type { RichTextDocument } from "@/lib/tiptap/json";

export function renderRichTextDocument(document: RichTextDocument): string {
	const html = renderToHTMLString({ content: document, extensions: createRichTextExtensions() });
	return sanitizeRichText(html);
}
