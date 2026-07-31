import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import { createRichTextExtensions } from "@/lib/tiptap/extensions";
import type { RichTextDocument } from "@/lib/tiptap/json";
import { sanitizeRichText } from "@/shared/rich-text";

export function renderRichTextDocument(document: RichTextDocument): string {
	const html = renderToHTMLString({ content: document, extensions: createRichTextExtensions() });
	return sanitizeRichText(html);
}
