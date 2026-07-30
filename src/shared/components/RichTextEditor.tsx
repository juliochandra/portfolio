"use client";

import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { type ReactNode, useEffect, useState } from "react";
import {
	FaAlignCenter,
	FaAlignJustify,
	FaAlignLeft,
	FaAlignRight,
	FaBold,
	FaCode,
	FaEraser,
	FaHighlighter,
	FaImage,
	FaItalic,
	FaLink,
	FaListOl,
	FaListUl,
	FaMinus,
	FaPalette,
	FaQuoteRight,
	FaStrikethrough,
	FaSubscript,
	FaSuperscript,
	FaUnderline,
} from "react-icons/fa";
import { FaRotateLeft, FaRotateRight } from "react-icons/fa6";
import {
	type MediaImagePickerFolder,
	type MediaImagePickerItem,
	MediaImagePickerModal,
} from "@/shared/components/MediaImagePickerModal";
import { createRichTextExtensions } from "@/shared/tiptap/extensions";

type RichTextEditorProps = {
	disabled?: boolean;
	folders?: MediaImagePickerFolder[];
	initialContent: JSONContent;
	label: string;
	media?: MediaImagePickerItem[];
	mediaCurrentPage?: number;
	mediaTotalPages?: number;
	name: string;
};

type ToolbarButtonProps = {
	active?: boolean;
	children: ReactNode;
	disabled: boolean;
	label: string;
	onClick: () => void;
};

type ColorPickerType = "highlight" | "text";

type EditorSelection = {
	from: number;
	to: number;
};

const textColors = [
	{ name: "Black", value: "#1f2328" },
	{ name: "Gray", value: "#59636e" },
	{ name: "Red", value: "#cf222e" },
	{ name: "Pink", value: "#bf3989" },
	{ name: "Orange", value: "#bc4c00" },
	{ name: "Yellow", value: "#9a6700" },
	{ name: "Green", value: "#1f883d" },
	{ name: "Teal", value: "#1b7c83" },
	{ name: "Blue", value: "#0969da" },
	{ name: "Indigo", value: "#5a32a3" },
	{ name: "Purple", value: "#8250df" },
	{ name: "Brown", value: "#8a4b08" },
] as const;

const highlightColors = [
	{ name: "Gray", value: "#eaeef2" },
	{ name: "Yellow", value: "#fef08a" },
	{ name: "Orange", value: "#fed7aa" },
	{ name: "Red", value: "#fecaca" },
	{ name: "Pink", value: "#fbcfe8" },
	{ name: "Green", value: "#bbf7d0" },
	{ name: "Teal", value: "#99f6e4" },
	{ name: "Blue", value: "#bfdbfe" },
	{ name: "Indigo", value: "#c7d2fe" },
	{ name: "Purple", value: "#ddd6fe" },
	{ name: "Brown", value: "#e8c39e" },
	{ name: "Black", value: "#d1d5db" },
] as const;

function isAllowedUrl(url: string, allowedProtocols: string[]): boolean {
	try {
		const parsedUrl = new URL(url);
		return allowedProtocols.includes(parsedUrl.protocol.replace(":", ""));
	} catch {
		return false;
	}
}

export function RichTextEditor({
	disabled = false,
	folders = [],
	initialContent,
	label,
	media = [],
	mediaCurrentPage = 1,
	mediaTotalPages = 1,
	name,
}: RichTextEditorProps) {
	const [content, setContent] = useState(() => JSON.stringify(initialContent));
	const [colorPickerType, setColorPickerType] = useState<ColorPickerType | null>(null);
	const [colorSelection, setColorSelection] = useState<EditorSelection | null>(null);
	const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
	const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
	const [linkError, setLinkError] = useState<string | null>(null);
	const [linkSelection, setLinkSelection] = useState<EditorSelection | null>(null);
	const [linkText, setLinkText] = useState("");
	const [linkUrl, setLinkUrl] = useState("");
	const editor = useEditor({
		content: initialContent,
		editable: !disabled,
		extensions: createRichTextExtensions(),
		immediatelyRender: false,
		onUpdate: ({ editor: updatedEditor }) => setContent(JSON.stringify(updatedEditor.getJSON())),
		editorProps: {
			attributes: {
				"aria-label": label,
				class: "min-h-72 p-4 outline-none [&_a]:text-accent [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-accent [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_h1]:mt-6 [&_h1]:font-bold [&_h1]:text-4xl [&_h2]:mt-5 [&_h2]:font-bold [&_h2]:text-3xl [&_h3]:mt-4 [&_h3]:font-bold [&_h3]:text-2xl [&_h4]:mt-4 [&_h4]:font-bold [&_h4]:text-xl [&_h5]:mt-4 [&_h5]:font-bold [&_h5]:text-lg [&_hr]:my-6 [&_img]:my-4 [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_img]:rounded-lg [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-surface [&_pre]:p-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6",
				role: "textbox",
			},
		},
	});

	useEffect(() => {
		editor?.setEditable(!disabled);
	}, [disabled, editor]);

	function openLinkPopover() {
		if (!editor) return;

		const selection = { from: editor.state.selection.from, to: editor.state.selection.to };
		setLinkSelection(selection);
		setLinkText(editor.state.doc.textBetween(selection.from, selection.to, " "));
		setLinkUrl((editor.getAttributes("link").href as string | undefined) ?? "");
		setLinkError(null);
		setIsLinkPopoverOpen(true);
	}

	function applyLink() {
		if (!editor) return;

		const url = linkUrl.trim();
		if (!isAllowedUrl(url, ["http", "https", "mailto"])) {
			setLinkError("Enter a valid URL.");
			return;
		}

		const text = linkText.trim();
		if (!text) {
			setLinkError("Enter text to display.");
			return;
		}

		const selection = linkSelection ?? { from: editor.state.selection.from, to: editor.state.selection.to };
		editor
			.chain()
			.focus()
			.setTextSelection(selection)
			.insertContent({
				type: "text",
				text,
				marks: [{ type: "link", attrs: { href: url } }],
			})
			.run();
		setIsLinkPopoverOpen(false);
	}

	function clearLink() {
		if (!editor) return;

		const selection = linkSelection ?? { from: editor.state.selection.from, to: editor.state.selection.to };
		editor.chain().focus().setTextSelection(selection).extendMarkRange("link").unsetLink().run();
		setIsLinkPopoverOpen(false);
	}

	function insertImage(url: string) {
		if (!editor) return;

		const trimmedUrl = url.trim();
		if (!isAllowedUrl(trimmedUrl, ["http", "https"])) return;
		editor.chain().focus().setImage({ src: trimmedUrl }).run();
	}

	function openColorPicker(type: ColorPickerType) {
		if (!editor) return;

		setColorSelection({ from: editor.state.selection.from, to: editor.state.selection.to });
		setColorPickerType(type);
	}

	function applyColor(color: string) {
		if (!editor || !colorPickerType) return;

		const selection = colorSelection ?? { from: editor.state.selection.from, to: editor.state.selection.to };
		const chain = editor.chain().focus();
		chain.setTextSelection(selection);

		if (colorPickerType === "text") {
			chain.setColor(color);
		} else {
			chain.setHighlight({ color });
		}

		if (selection.from !== selection.to) {
			chain.setTextSelection(selection.to);
			if (colorPickerType === "text") {
				chain.unsetColor();
			} else {
				chain.unsetHighlight();
			}
		}

		chain.run();
		setColorPickerType(null);
	}

	function clearColor() {
		if (!editor || !colorPickerType) return;

		const chain = editor.chain().focus();
		if (colorSelection) chain.setTextSelection(colorSelection);

		if (colorPickerType === "text") {
			chain.unsetColor().run();
		} else {
			chain.unsetHighlight().run();
		}

		setColorPickerType(null);
	}

	return (
		<div className="rounded-md border border-border bg-canvas focus-within:border-accent">
			<input type="hidden" name={name} value={content} />
			<div
				aria-label="Rich text toolbar"
				className="sticky top-0 z-10 flex flex-wrap gap-1 border-border border-b bg-surface p-2"
				role="toolbar"
			>
				<ToolbarButton
					active={editor?.isActive("bold")}
					disabled={!editor || disabled}
					label="Bold"
					onClick={() => editor?.chain().focus().toggleBold().run()}
				>
					<FaBold aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive("italic")}
					disabled={!editor || disabled}
					label="Italic"
					onClick={() => editor?.chain().focus().toggleItalic().run()}
				>
					<FaItalic aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive("underline")}
					disabled={!editor || disabled}
					label="Underline"
					onClick={() => editor?.chain().focus().toggleUnderline().run()}
				>
					<FaUnderline aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive("strike")}
					disabled={!editor || disabled}
					label="Strikethrough"
					onClick={() => editor?.chain().focus().toggleStrike().run()}
				>
					<FaStrikethrough aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive("superscript")}
					disabled={!editor || disabled}
					label="Superscript"
					onClick={() => editor?.chain().focus().toggleSuperscript().run()}
				>
					<FaSuperscript aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive("subscript")}
					disabled={!editor || disabled}
					label="Subscript"
					onClick={() => editor?.chain().focus().toggleSubscript().run()}
				>
					<FaSubscript aria-hidden="true" />
				</ToolbarButton>
				<ColorPickerTrigger
					disabled={!editor || disabled}
					icon={<FaPalette aria-hidden="true" />}
					isOpen={colorPickerType === "text"}
					label="Text color"
					onClear={clearColor}
					onClose={() => setColorPickerType(null)}
					onOpen={() => openColorPicker("text")}
					onSelect={applyColor}
					type="text"
				/>
				<ColorPickerTrigger
					disabled={!editor || disabled}
					icon={<FaHighlighter aria-hidden="true" />}
					isOpen={colorPickerType === "highlight"}
					label="Highlight color"
					onClear={clearColor}
					onClose={() => setColorPickerType(null)}
					onOpen={() => openColorPicker("highlight")}
					onSelect={applyColor}
					type="highlight"
				/>
				<ToolbarButton
					disabled={!editor || disabled}
					label="Clear formatting"
					onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
				>
					<FaEraser aria-hidden="true" />
				</ToolbarButton>
				<ToolbarSeparator />
				<ToolbarButton
					active={editor?.isActive("heading", { level: 1 })}
					disabled={!editor || disabled}
					label="Heading 1"
					onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
				>
					<span className="font-bold text-xs">H1</span>
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive("heading", { level: 2 })}
					disabled={!editor || disabled}
					label="Heading 2"
					onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
				>
					<span className="font-bold text-xs">H2</span>
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive("heading", { level: 3 })}
					disabled={!editor || disabled}
					label="Heading 3"
					onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
				>
					<span className="font-bold text-xs">H3</span>
				</ToolbarButton>
				<ToolbarSeparator />
				<ToolbarButton
					active={editor?.isActive("bulletList")}
					disabled={!editor || disabled}
					label="Bullet list"
					onClick={() => editor?.chain().focus().toggleBulletList().run()}
				>
					<FaListUl aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive("orderedList")}
					disabled={!editor || disabled}
					label="Ordered list"
					onClick={() => editor?.chain().focus().toggleOrderedList().run()}
				>
					<FaListOl aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive("blockquote")}
					disabled={!editor || disabled}
					label="Blockquote"
					onClick={() => editor?.chain().focus().toggleBlockquote().run()}
				>
					<FaQuoteRight aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive("codeBlock")}
					disabled={!editor || disabled}
					label="Code block"
					onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
				>
					<FaCode aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					disabled={!editor || disabled}
					label="Horizontal rule"
					onClick={() => editor?.chain().focus().setHorizontalRule().run()}
				>
					<FaMinus aria-hidden="true" />
				</ToolbarButton>
				<ToolbarSeparator />
				<ToolbarButton
					active={editor?.isActive({ textAlign: "left" })}
					disabled={!editor || disabled}
					label="Align left"
					onClick={() => editor?.chain().focus().setTextAlign("left").run()}
				>
					<FaAlignLeft aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive({ textAlign: "center" })}
					disabled={!editor || disabled}
					label="Align center"
					onClick={() => editor?.chain().focus().setTextAlign("center").run()}
				>
					<FaAlignCenter aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive({ textAlign: "right" })}
					disabled={!editor || disabled}
					label="Align right"
					onClick={() => editor?.chain().focus().setTextAlign("right").run()}
				>
					<FaAlignRight aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton
					active={editor?.isActive({ textAlign: "justify" })}
					disabled={!editor || disabled}
					label="Justify"
					onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
				>
					<FaAlignJustify aria-hidden="true" />
				</ToolbarButton>
				<ToolbarSeparator />
				<div className="relative">
					<ToolbarButton
						active={editor?.isActive("link")}
						disabled={!editor || disabled}
						label="Link"
						onClick={openLinkPopover}
					>
						<FaLink aria-hidden="true" />
					</ToolbarButton>
					{isLinkPopoverOpen ? (
						<LinkPopover
							error={linkError}
							onApply={applyLink}
							onClear={clearLink}
							onClose={() => setIsLinkPopoverOpen(false)}
							onTextChange={setLinkText}
							onUrlChange={setLinkUrl}
							text={linkText}
							url={linkUrl}
						/>
					) : null}
				</div>
				<ToolbarButton disabled={!editor || disabled} label="Insert image" onClick={() => setIsImagePickerOpen(true)}>
					<FaImage aria-hidden="true" />
				</ToolbarButton>
				<ToolbarSeparator />
				<ToolbarButton disabled={!editor || disabled} label="Undo" onClick={() => editor?.chain().focus().undo().run()}>
					<FaRotateLeft aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton disabled={!editor || disabled} label="Redo" onClick={() => editor?.chain().focus().redo().run()}>
					<FaRotateRight aria-hidden="true" />
				</ToolbarButton>
			</div>
			<EditorContent editor={editor} />
			{isImagePickerOpen ? (
				<MediaImagePickerModal
					currentPage={mediaCurrentPage}
					folders={folders}
					media={media}
					onClose={() => setIsImagePickerOpen(false)}
					onSelect={insertImage}
					title="Insert Image"
					totalPages={mediaTotalPages}
				/>
			) : null}
		</div>
	);
}

function ColorPickerTrigger({
	disabled,
	icon,
	isOpen,
	label,
	onClear,
	onClose,
	onOpen,
	onSelect,
	type,
}: {
	disabled: boolean;
	icon: ReactNode;
	isOpen: boolean;
	label: string;
	onClear: () => void;
	onClose: () => void;
	onOpen: () => void;
	onSelect: (color: string) => void;
	type: ColorPickerType;
}) {
	return (
		<div className="relative">
			<ToolbarButton disabled={disabled} label={label} onClick={onOpen}>
				{icon}
			</ToolbarButton>
			{isOpen ? <ColorPicker onClear={onClear} onClose={onClose} onSelect={onSelect} type={type} /> : null}
		</div>
	);
}

function ColorPicker({
	onClear,
	onClose,
	onSelect,
	type,
}: {
	onClear: () => void;
	onClose: () => void;
	onSelect: (color: string) => void;
	type: ColorPickerType;
}) {
	const colors = type === "text" ? textColors : highlightColors;
	const title = type === "text" ? "Text color" : "Highlight color";
	const [customColor, setCustomColor] = useState<string>(colors[0].value);

	return (
		<div
			className="absolute top-full left-0 z-30 mt-2 w-72 rounded-xl border border-border bg-canvas p-4 shadow-xl"
			role="dialog"
			aria-label={title}
		>
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="font-semibold text-sm text-text">{title}</p>
					<p className="mt-1 text-text-mute text-xs">Select text first, then choose a color.</p>
				</div>
				<button
					type="button"
					aria-label={`Close ${title}`}
					onClick={onClose}
					className="grid size-7 place-items-center rounded-md text-text-mute hover:bg-surface hover:text-text"
				>
					<span aria-hidden="true">×</span>
				</button>
			</div>
			<p className="mt-5 font-medium text-text text-xs">Preset colors</p>
			<div className="mt-3 grid grid-cols-6 gap-2.5">
				{colors.map((color) => (
					<button
						key={color.value}
						type="button"
						aria-label={`${color.name} ${title}`}
						className="size-8 rounded-full border-2 border-canvas shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent"
						onClick={() => onSelect(color.value)}
						onMouseDown={(event) => event.preventDefault()}
						style={{ backgroundColor: color.value }}
					/>
				))}
			</div>
			<div className="mt-5 border-border border-t pt-4">
				<p className="font-medium text-text text-xs">Custom color</p>
				<div className="mt-3 flex items-center justify-between gap-3">
					<label className="flex items-center gap-2 text-text-mute text-xs">
						<input
							aria-label={`Custom ${title}`}
							className="size-9 cursor-pointer rounded-md border border-border bg-canvas p-0.5"
							onChange={(event) => setCustomColor(event.target.value)}
							type="color"
							value={customColor}
						/>
						<span>{customColor.toUpperCase()}</span>
					</label>
					<div className="flex items-center gap-3">
						<button
							type="button"
							className="font-medium text-accent text-sm hover:underline"
							onClick={() => onSelect(customColor)}
							onMouseDown={(event) => event.preventDefault()}
						>
							Apply
						</button>
						<button
							type="button"
							className="text-sm text-text-mute underline hover:text-text"
							onClick={onClear}
							onMouseDown={(event) => event.preventDefault()}
						>
							Clear
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function LinkPopover({
	error,
	onApply,
	onClear,
	onClose,
	onTextChange,
	onUrlChange,
	text,
	url,
}: {
	error: string | null;
	onApply: () => void;
	onClear: () => void;
	onClose: () => void;
	onTextChange: (text: string) => void;
	onUrlChange: (url: string) => void;
	text: string;
	url: string;
}) {
	return (
		<div
			aria-label="Link"
			className="absolute top-full left-0 z-30 mt-2 w-80 rounded-xl border border-border bg-canvas p-4 shadow-xl"
			role="dialog"
		>
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="font-semibold text-sm text-text">Link</p>
					<p className="mt-1 text-text-mute text-xs">Add linked text and its destination URL.</p>
				</div>
				<button
					aria-label="Close Link"
					className="grid size-7 place-items-center rounded-md text-text-mute hover:bg-surface hover:text-text"
					onClick={onClose}
					type="button"
				>
					<span aria-hidden="true">×</span>
				</button>
			</div>
			<label className="mt-5 block font-medium text-text text-xs" htmlFor="rich-text-link-text">
				Text to display
				<input
					className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
					id="rich-text-link-text"
					onChange={(event) => onTextChange(event.target.value)}
					placeholder="Read more"
					type="text"
					value={text}
				/>
			</label>
			<label className="mt-4 block font-medium text-text text-xs" htmlFor="rich-text-link-url">
				URL
				<input
					className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
					id="rich-text-link-url"
					onChange={(event) => onUrlChange(event.target.value)}
					onKeyDown={(event) => {
						if (event.key !== "Enter") return;

						event.preventDefault();
						onApply();
					}}
					placeholder="https://example.com"
					type="url"
					value={url}
				/>
			</label>
			<p className="mt-2 text-text-mute text-xs">Use an http, https, or mailto URL.</p>
			{error ? (
				<p className="mt-2 text-danger text-xs" role="alert">
					{error}
				</p>
			) : null}
			<div className="mt-5 flex items-center justify-between gap-3">
				<button
					className="font-medium text-accent text-sm hover:underline"
					onClick={onClear}
					onMouseDown={(event) => event.preventDefault()}
					type="button"
				>
					Clear link
				</button>
				<button
					className="rounded-md bg-accent px-3 py-2 font-medium text-sm text-white hover:opacity-90"
					onClick={onApply}
					onMouseDown={(event) => event.preventDefault()}
					type="button"
				>
					Apply
				</button>
			</div>
		</div>
	);
}

function ToolbarSeparator() {
	return <div aria-hidden="true" className="mx-1 h-6 self-center border-border border-l" />;
}

function ToolbarButton({ active = false, children, disabled, label, onClick }: ToolbarButtonProps) {
	return (
		<button
			type="button"
			aria-label={label}
			aria-pressed={active}
			disabled={disabled}
			onClick={onClick}
			onMouseDown={(event) => event.preventDefault()}
			title={label}
			className={`grid size-9 place-items-center rounded-md disabled:opacity-50 ${
				active ? "bg-accent/10 text-accent" : "text-text-mute hover:bg-canvas hover:text-text"
			}`}
		>
			{children}
		</button>
	);
}
