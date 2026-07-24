import sanitizeHtml from "sanitize-html";

const allowedTags = [
	"a",
	"blockquote",
	"br",
	"code",
	"em",
	"h1",
	"h2",
	"h3",
	"hr",
	"img",
	"li",
	"mark",
	"ol",
	"p",
	"pre",
	"s",
	"span",
	"strong",
	"sub",
	"sup",
	"u",
	"ul",
] as const;

const allowedCssColor = /^(?:#(?:[0-9a-f]{3}|[0-9a-f]{6})|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\))$/iu;
const allowedTextColor = /^(?:#(?:[0-9a-f]{3}|[0-9a-f]{6})|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|inherit)$/iu;

function isHexColor(color: string | undefined): boolean {
	return Boolean(color && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/iu.test(color));
}

function isAllowedImageUrl(url: string | undefined): boolean {
	return Boolean(url && /^https?:\/\//iu.test(url));
}

export function sanitizeRichText(content: string): string {
	return sanitizeHtml(content, {
		allowedAttributes: {
			"*": ["style"],
			a: ["href", "rel", "target"],
			img: ["alt", "src", "title"],
			mark: ["data-color"],
		},
		allowedSchemes: ["http", "https", "mailto"],
		allowedStyles: {
			"*": {
				"background-color": [allowedCssColor],
				color: [allowedTextColor],
				"text-align": [/^(?:left|center|right|justify)$/u],
			},
		},
		allowedTags: [...allowedTags],
		exclusiveFilter: (frame) => frame.tag === "img" && !isAllowedImageUrl(frame.attribs.src),
		transformTags: {
			a: (tagName, attributes) => ({
				attribs: { ...attributes, rel: "noopener noreferrer", target: "_blank" },
				tagName,
			}),
			mark: (tagName, attributes) => {
				const color = attributes["data-color"];
				if (!isHexColor(color) || attributes.style) return { attribs: attributes, tagName };

				return {
					attribs: { ...attributes, style: `background-color: ${color}; color: inherit` },
					tagName,
				};
			},
		},
	});
}

export function richTextToPlainText(content: string): string {
	return sanitizeRichText(content)
		.replace(/<[^>]*>/gu, " ")
		.replace(/&nbsp;/gu, " ")
		.replace(/\s+/gu, " ")
		.replace(/\s+([.,!?;:])/gu, "$1")
		.trim();
}
