"use client";

import { useState } from "react";
import { CiLink } from "react-icons/ci";
import { FaLinkedin } from "react-icons/fa";
import { SiX } from "react-icons/si";

type ShareLinksProps = {
	title: string;
};

export function ShareLinks({ title }: ShareLinksProps) {
	const [copyMessage, setCopyMessage] = useState<string | null>(null);

	function openShareWindow(baseUrl: string) {
		const pageUrl = encodeURIComponent(window.location.href);
		const pageTitle = encodeURIComponent(title);
		window.open(`${baseUrl}${pageUrl}&text=${pageTitle}`, "_blank", "noopener,noreferrer");
	}

	async function copyPageUrl() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopyMessage("Tautan berhasil disalin.");
		} catch {
			setCopyMessage("Tautan tidak dapat disalin.");
		}
	}

	return (
		<section className="mt-12 border-border border-t pt-8" aria-labelledby="share-links-title">
			<h2 id="share-links-title" className="font-bold text-lg">
				Bagikan tulisan
			</h2>
			<div className="mt-4 flex flex-wrap gap-3">
				<button
					type="button"
					onClick={() => openShareWindow("https://twitter.com/intent/tweet?url=")}
					className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-medium hover:bg-surface"
				>
					<SiX aria-hidden="true" />
					Twitter
				</button>
				<button
					type="button"
					onClick={() => openShareWindow("https://www.linkedin.com/sharing/share-offsite/?url=")}
					className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-medium hover:bg-surface"
				>
					<FaLinkedin aria-hidden="true" />
					LinkedIn
				</button>
				<button
					type="button"
					onClick={copyPageUrl}
					className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-medium hover:bg-surface"
				>
					<CiLink className="text-xl" aria-hidden="true" />
					Salin tautan
				</button>
			</div>
			{copyMessage ? <output className="mt-3 block text-sm text-text-mute">{copyMessage}</output> : null}
		</section>
	);
}
