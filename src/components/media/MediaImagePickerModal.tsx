"use client";

import { useState } from "react";
import { FaFolder } from "react-icons/fa6";
import { Button } from "@/components/ui/Button";
import { getMediaGalleryPage } from "@/features/media/media.action";

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
	currentPage: number;
	folders: MediaImagePickerFolder[];
	media: MediaImagePickerItem[];
	onClose: () => void;
	onClear?: () => void;
	onSelect: (url: string) => void;
	selectedUrl?: string;
	title: string;
	totalPages: number;
};

export function MediaImagePickerModal({
	currentPage,
	folders,
	media,
	onClear,
	onClose,
	onSelect,
	selectedUrl,
	title,
	totalPages,
}: MediaImagePickerModalProps) {
	const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
	const [gallery, setGallery] = useState({ currentPage, media, totalPages });
	const [isLoadingGallery, setIsLoadingGallery] = useState(false);
	const activeFolder = folders.find((folder) => folder.id === activeFolderId) ?? null;
	const sortedFolders = [...folders].sort((firstFolder, secondFolder) =>
		firstFolder.name.localeCompare(secondFolder.name, "id", { sensitivity: "base" }),
	);
	const visibleMedia = [...gallery.media].sort((firstItem, secondItem) =>
		firstItem.fileName.localeCompare(secondItem.fileName, "id", { sensitivity: "base" }),
	);

	async function loadGallery(folderId: string | null, page: number) {
		setActiveFolderId(folderId);
		setGallery({ currentPage: page, media: [], totalPages: 1 });
		setIsLoadingGallery(true);
		try {
			const result = await getMediaGalleryPage({ folderId, page });
			if ("error" in result) return;

			setGallery(result.data);
		} finally {
			setIsLoadingGallery(false);
		}
	}

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
					<Button type="button" variant="secondary" className="mt-6" onClick={() => loadGallery(null, 1)}>
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
									onClick={() => loadGallery(folder.id, 1)}
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
					{visibleMedia.length === 0 && !isLoadingGallery ? (
						<p className="mt-6 text-sm text-text-mute">Belum ada gambar di galeri Media.</p>
					) : (
						<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
							{isLoadingGallery ? <p className="col-span-full text-sm text-text-mute">Memuat gambar…</p> : null}
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
					{gallery.totalPages > 1 ? (
						<nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination gambar">
							{gallery.currentPage > 1 ? (
								<button
									className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isLoadingGallery}
									onClick={() => loadGallery(activeFolderId, gallery.currentPage - 1)}
									type="button"
								>
									Sebelumnya
								</button>
							) : null}
							{Array.from({ length: gallery.totalPages }, (_, index) => index + 1).map((page) => (
								<button
									aria-current={page === gallery.currentPage ? "page" : undefined}
									className={
										page === gallery.currentPage
											? "rounded-md bg-accent px-3 py-2 font-semibold text-sm text-white"
											: "rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
									}
									disabled={isLoadingGallery}
									key={page}
									onClick={() => loadGallery(activeFolderId, page)}
									type="button"
								>
									{page}
								</button>
							))}
							{gallery.currentPage < gallery.totalPages ? (
								<button
									className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isLoadingGallery}
									onClick={() => loadGallery(activeFolderId, gallery.currentPage + 1)}
									type="button"
								>
									Berikutnya
								</button>
							) : null}
						</nav>
					) : null}
				</section>
			</div>
		</div>
	);
}
