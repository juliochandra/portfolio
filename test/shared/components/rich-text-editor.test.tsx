/** biome-ignore-all lint/nursery/noSecrets: Component names and HTML fixtures are not secrets. */
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RichTextEditor } from "@/shared/components/RichTextEditor";

const initialContent = {
	content: [{ content: [{ text: "Isi awal", type: "text" }], type: "paragraph" }],
	type: "doc",
};

const emptyContent = {
	content: [{ type: "paragraph" }],
	type: "doc",
};

describe("RichTextEditor", () => {
	afterEach(() => cleanup());

	it("renders the editor and its formatting controls", async () => {
		const editor = render(<RichTextEditor initialContent={initialContent} label="Isi" name="content" />);

		await waitFor(() => expect(editor.getByRole("textbox", { name: "Isi" })).toBeInTheDocument());
		expect(editor.getByRole("toolbar", { name: "Rich text toolbar" })).toHaveClass("sticky", "top-0");
		expect(editor.getByRole("button", { name: "Bold" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Link" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Link" })).toHaveAttribute("title", "Link");
		expect(editor.getByRole("button", { name: "Insert image" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Align center" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Text color" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Superscript" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Subscript" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Heading 1" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Heading 2" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Heading 3" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Bullet list" })).toBeInTheDocument();
		const submittedContent = editor.container.querySelector('input[name="content"]') as HTMLInputElement;
		expect(JSON.parse(submittedContent.value)).toMatchObject(initialContent);
	});

	it("uses a JSON document as the submitted value", async () => {
		const editor = render(<RichTextEditor initialContent={initialContent} label="Isi" name="content" />);

		await waitFor(() => expect(editor.getByRole("textbox", { name: "Isi" })).toBeInTheDocument());
		const submittedContent = editor.container.querySelector('input[name="content"]') as HTMLInputElement;
		expect(JSON.parse(submittedContent.value)).toMatchObject(initialContent);
	});

	it("opens the media gallery to insert an image", async () => {
		const editor = render(
			<RichTextEditor
				folders={[{ id: "folder-1", name: "Galeri" }]}
				initialContent={emptyContent}
				label="Isi"
				media={[{ fileName: "gambar.jpg", folderId: null, id: "media-1", url: "https://example.com/gambar.jpg" }]}
				name="content"
			/>,
		);

		await waitFor(() => expect(editor.getByRole("button", { name: "Insert image" })).not.toBeDisabled());
		fireEvent.click(editor.getByRole("button", { name: "Insert image" }));

		expect(editor.getByRole("dialog", { name: "Insert Image" })).toBeInTheDocument();
		fireEvent.click(editor.getByRole("button", { name: "Pilih gambar.jpg" }));

		await waitFor(() => expect(editor.queryByRole("dialog", { name: "Insert Image" })).not.toBeInTheDocument());
		expect(editor.getByRole("textbox", { name: "Isi" }).querySelector("img")).toHaveAttribute(
			"src",
			"https://example.com/gambar.jpg",
		);
	});

	it("opens a text color palette", async () => {
		const editor = render(<RichTextEditor initialContent={initialContent} label="Isi" name="content" />);

		await waitFor(() => expect(editor.getByRole("button", { name: "Text color" })).not.toBeDisabled());
		fireEvent.click(editor.getByRole("button", { name: "Text color" }));

		expect(editor.getByRole("dialog", { name: "Text color" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Blue Text color" })).toBeInTheDocument();
		fireEvent.change(editor.getByLabelText("Custom Text color"), { target: { value: "#ff0000" } });
		expect(editor.getByRole("dialog", { name: "Text color" })).toBeInTheDocument();
		expect(editor.getByRole("button", { name: "Apply" })).toBeInTheDocument();
	});

	it("opens a link popover with a URL input", async () => {
		const editor = render(<RichTextEditor initialContent={initialContent} label="Isi" name="content" />);

		await waitFor(() => expect(editor.getByRole("button", { name: "Link" })).not.toBeDisabled());
		fireEvent.click(editor.getByRole("button", { name: "Link" }));

		expect(editor.getByRole("dialog", { name: "Link" })).toBeInTheDocument();
		expect(editor.getByRole("textbox", { name: "Text to display" })).toHaveAttribute("type", "text");
		expect(editor.getByRole("textbox", { name: "URL" })).toHaveAttribute("type", "url");
		expect(editor.getByRole("button", { name: "Clear link" })).toBeInTheDocument();
	});

	it("inserts the supplied text as a link", async () => {
		const editor = render(<RichTextEditor initialContent={emptyContent} label="Isi" name="content" />);

		await waitFor(() => expect(editor.getByRole("button", { name: "Link" })).not.toBeDisabled());
		fireEvent.click(editor.getByRole("button", { name: "Link" }));
		fireEvent.change(editor.getByRole("textbox", { name: "Text to display" }), { target: { value: "Portfolio" } });
		fireEvent.change(editor.getByRole("textbox", { name: "URL" }), { target: { value: "https://example.com" } });
		fireEvent.click(editor.getByRole("button", { name: "Apply" }));

		await waitFor(() =>
			expect(editor.getByRole("textbox", { name: "Isi" }).querySelector("a")).toHaveTextContent("Portfolio"),
		);
		expect(editor.getByRole("textbox", { name: "Isi" }).querySelector("a")).toHaveAttribute("href", "https://example.com");
	});

	it("shows an error for an unsupported link URL", async () => {
		const editor = render(<RichTextEditor initialContent={initialContent} label="Isi" name="content" />);

		await waitFor(() => expect(editor.getByRole("button", { name: "Link" })).not.toBeDisabled());
		fireEvent.click(editor.getByRole("button", { name: "Link" }));
		fireEvent.change(editor.getByRole("textbox", { name: "URL" }), { target: { value: "javascript:alert(1)" } });
		fireEvent.click(editor.getByRole("button", { name: "Apply" }));

		expect(editor.getByRole("alert")).toHaveTextContent("Enter a valid URL.");
	});
});
