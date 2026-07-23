"use client";

import { useState } from "react";
import { FaFolder } from "react-icons/fa6";
import { Button } from "@/shared/components/Button";

export type MediaImagePickerFolder = {
	id: string;
	name: string;
};

export type MediaImagePickerItem = {
	fileName: string;
	folderId: string | null;
	id: string;
	url: string;
};

type MediaImagePickerModalProps = {
	folders: MediaImagePickerFolder[];
	media: MediaImagePickerItem[];
	onClose: () => void;
	onClear?: () => void;
	onSelect: (url: string) => void;
	selectedUrl?: string;
	title: string;
};

export function MediaImagePickerModal({
	folders,
	media,
	onClear,
	onClose,
	onSelect,
	selectedUrl,
	title,
}: MediaImagePickerModalProps) {
	const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
	const activeFolder = folders.find((folder) => folder.id === activeFolderId) ?? null;
	const sortedFolders = [...folders].sort((firstFolder, secondFolder) =>
		firstFolder.name.localeCompare(secondFolder.name, "id", { sensitivity: "base" }),
	);
	const visibleMedia = [...media]
		.filter((item) => item.folderId === activeFolderId)
		.sort((firstItem, secondItem) => firstItem.fileName.localeCompare(secondItem.fileName, "id", { sensitivity: "base" }));

	function selectImage(url: string) {
		onSelect(url);
		onClose();
	}

	function clearImage() {
		onClear?.();
		onClose();
	}

	return (
		<div className="fixed inset-0 z-50 grid place-items-center p-5" role="dialog" aria-label={title} aria-modal="true">
			<button type="button" aria-label="Tutup pemilih gambar" onClick={onClose} className="absolute inset-0 bg-black/50" />
			<div className="relative max-h-full w-full max-w-4xl overflow-y-auto rounded-xl border border-border bg-canvas p-5 shadow-xl sm:p-8">
				<div className="flex items-center justify-between gap-4">
					<h2 className="font-bold text-xl">{title}</h2>
					<Button type="button" variant="secondary" onClick={onClose}>
						Tutup
					</Button>
				</div>
				{onClear ? (
					<Button type="button" variant="secondary" className="mt-6" onClick={clearImage}>
						Tanpa gambar
					</Button>
				) : null}
				{activeFolder ? (
					<Button type="button" variant="secondary" className="mt-6" onClick={() => setActiveFolderId(null)}>
						← Kembali ke Media
					</Button>
				) : null}
				{!activeFolder && sortedFolders.length > 0 ? (
					<section className="mt-6">
						<h3 className="font-semibold">Folder</h3>
						<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
							{sortedFolders.map((folder) => (
								<button
									key={folder.id}
									type="button"
									onClick={() => setActiveFolderId(folder.id)}
									className="flex flex-col items-center gap-2 rounded-md p-2 text-center transition-colors hover:bg-surface hover:text-accent"
								>
									<FaFolder className="text-3xl" aria-hidden="true" />
									<span className="line-clamp-2 break-words font-medium">{folder.name}</span>
								</button>
							))}
						</div>
					</section>
				) : null}
				<section className="mt-6">
					<h3 className="font-semibold">{activeFolder?.name ?? "Gambar"}</h3>
					{visibleMedia.length === 0 ? (
						<p className="mt-6 text-sm text-text-mute">Belum ada gambar di galeri Media.</p>
					) : (
						<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
							{visibleMedia.map((item) => (
								<button
									key={item.id}
									type="button"
									aria-label={`Pilih ${item.fileName}`}
									onClick={() => selectImage(item.url)}
									className={`overflow-hidden rounded-lg border p-1 text-left transition-colors ${
										selectedUrl === item.url ? "border-accent" : "border-border hover:border-accent"
									}`}
								>
									{/* biome-ignore lint/performance/noImgElement: URL gambar dipilih dari galeri Media yang dikelola admin. */}
									<img src={item.url} alt={item.fileName} className="aspect-video w-full rounded-md object-cover" />
									<span className="block truncate px-2 py-1.5 text-sm" title={item.fileName}>
										{item.fileName}
									</span>
								</button>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
