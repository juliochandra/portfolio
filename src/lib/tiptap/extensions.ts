import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";

const headingLevels = [1, 2, 3] as const;

export function createRichTextExtensions() {
	return [
		StarterKit.configure({
			heading: { levels: [...headingLevels] },
			link: {
				HTMLAttributes: {
					rel: "noopener noreferrer",
					target: "_blank",
				},
				autolink: true,
				defaultProtocol: "https",
				openOnClick: false,
			},
		}),
		TextStyle,
		Color,
		Highlight.configure({ multicolor: true }),
		Subscript,
		Superscript,
		TextAlign.configure({ types: ["heading", "paragraph"] }),
		Image.configure({ allowBase64: false }),
	];
}
