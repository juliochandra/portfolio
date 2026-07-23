"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, useRef, useState } from "react";
import { MediaCard } from "@/app/admin/media/_components/MediaCard";
import { uploadMedia } from "@/features/media/media.action";
import { Button } from "@/shared/components/Button";
import { StatusMessage } from "@/shared/components/StatusMessage";

type Media = {
	createdAt: string;
	fileName: string;
	id: string;
	mimeType: string;
	size: number;
	url: string;
};

type MediaManagerProps = {
	media: Media[];
};

export function MediaManager({ media }: MediaManagerProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isUploading, setIsUploading] = useState(false);
	const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

	async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const fileInput = event.currentTarget;
		const file = fileInput.files?.[0];
		if (!file) {
			return;
		}

		setFields({});
		setMessage(null);
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.set("file", file);
			const result = await uploadMedia(formData);
			if ("error" in result) {
				setFields("fields" in result.error ? result.error.fields : { _form: result.error.message });
				return;
			}

			setMessage({ text: "Gambar terunggah.", type: "success" });
			router.refresh();
		} finally {
			fileInput.value = "";
			setIsUploading(false);
		}
	}

	function handleDeleted() {
		setMessage({ text: "Gambar terhapus.", type: "success" });
		router.refresh();
	}

	function handleDeleteError(errorMessage: string) {
		setMessage({ text: errorMessage, type: "error" });
	}

	return (
		<section>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h1 className="font-bold text-3xl tracking-tight">Media</h1>
				<Button type="button" onClick={() => fileInputRef.current?.click()}>
					+ Unggah Gambar
				</Button>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				aria-label="Pilih gambar untuk diunggah"
				className="sr-only"
				onChange={handleFileChange}
			/>
			{message ? <StatusMessage message={message.text} type={message.type} /> : null}
			{fields.file ? <StatusMessage message={fields.file} type="error" /> : null}
			{fields._form ? <StatusMessage message={fields._form} type="error" /> : null}
			{media.length === 0 && !isUploading ? (
				<div className="mt-8 rounded-xl border border-border bg-surface p-8 text-center text-text-mute">
					<p>Belum ada gambar. Unggah yang pertama.</p>
					<Button type="button" className="mt-4" onClick={() => fileInputRef.current?.click()}>
						+ Unggah Gambar
					</Button>
				</div>
			) : (
				<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
					{isUploading ? (
						<div className="aspect-square animate-pulse rounded-xl border border-border bg-surface p-4">
							<span className="text-sm text-text-mute">Mengunggah…</span>
						</div>
					) : null}
					{media.map((item) => (
						<MediaCard key={item.id} media={item} onDeleted={handleDeleted} onDeleteError={handleDeleteError} />
					))}
				</div>
			)}
		</section>
	);
}
