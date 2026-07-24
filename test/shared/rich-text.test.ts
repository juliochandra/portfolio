/** biome-ignore-all lint/nursery/noSecrets: HTML fixtures are not secrets. */
import { describe, expect, it } from "vitest";
import { richTextToPlainText, sanitizeRichText } from "@/shared/rich-text";

describe("rich text helpers", () => {
	it("removes unsafe HTML while keeping supported formatting", () => {
		const content = sanitizeRichText(
			'<p>Halo <strong>dunia</strong></p><script>alert("xss")</script><img src=x onerror=alert(1)>',
		);

		expect(content).toBe("<p>Halo <strong>dunia</strong></p>");
	});

	it("preserves supported editor formatting", () => {
		const content = sanitizeRichText(
			'<p style="text-align: center"><span style="color: rgb(9, 105, 218)">Teks</span> <mark data-color="#facc15" style="background-color: rgb(250, 204, 21); color: inherit">sorotan</mark><sup>2</sup><sub>n</sub><img src="https://example.com/image.jpg" alt="Contoh"></p>',
		);

		expect(content).toContain('style="text-align:center"');
		expect(content).toContain('style="color:rgb(9, 105, 218)"');
		expect(content).toContain('data-color="#facc15"');
		expect(content).toContain('style="background-color:rgb(250, 204, 21);color:inherit"');
		expect(content).toContain("<sup>2</sup><sub>n</sub>");
		expect(content).toContain('src="https://example.com/image.jpg"');
	});

	it("restores the style of a previously saved highlight", () => {
		const content = sanitizeRichText('<p><mark data-color="#b72481">Sorotan lama</mark></p>');

		expect(content).toContain('style="background-color:#b72481;color:inherit"');
	});

	it("opens links in a new tab with safe rel attributes", () => {
		const content = sanitizeRichText('<p><a href="https://example.com">Example</a></p>');

		expect(content).toContain('target="_blank"');
		expect(content).toContain('rel="noopener noreferrer"');
	});

	it("converts formatted HTML to plain text for reading time", () => {
		expect(richTextToPlainText("<h2>Judul</h2><p>Isi <strong>tulisan</strong>.</p>")).toBe("Judul Isi tulisan.");
	});
});
