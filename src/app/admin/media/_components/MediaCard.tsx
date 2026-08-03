"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteMedia } from "@/features/media/media.action";
import type { MediaGalleryItem } from "@/features/media/media.type";

type MediaCardProps = {
	media: MediaGalleryItem;
	onDeleteError: (message: string) => void;
	onDeleted: () => void;
};

function formatFileSize(size: number): string {
	if (size < 1024 * 1024) {
		return `${Math.ceil(size / 1024)} KB`;
	}

	return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaCard({ media, onDeleteError, onDeleted }: MediaCardProps) {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	async function handleDelete() {
		const result = await deleteMedia(media.id);
		if ("error" in result) {
			onDeleteError(result.error.message);
			return;
		}

		setIsConfirmOpen(false);
		onDeleted();
	}

	return (
		<article className="overflow-hidden rounded-xl border border-border bg-canvas">
			{/* biome-ignore lint/performance/noImgElement: media URLs are dynamically provided by the R2 gallery. */}
			<img src={media.url} alt={media.fileName} className="aspect-square w-full object-cover" />
			<div className="p-4">
				<p className="truncate font-medium" title={media.fileName}>
					{media.fileName}
				</p>
				<p className="mt-1 text-sm text-text-mute">{formatFileSize(media.size)}</p>
				<Button type="button" variant="danger" className="mt-4 w-full text-sm" onClick={() => setIsConfirmOpen(true)}>
					Hapus
				</Button>
			</div>
			<ConfirmDialog
				description="Bila masih dipakai di Project/Tulisan, tautannya di sana tidak otomatis kosong."
				itemName={`gambar '${media.fileName}'`}
				open={isConfirmOpen}
				onCancel={() => setIsConfirmOpen(false)}
				onConfirm={handleDelete}
			/>
		</article>
	);
}
