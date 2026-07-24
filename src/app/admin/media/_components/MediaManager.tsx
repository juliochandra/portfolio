"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { FaFolder, FaTrash } from "react-icons/fa6";
import { MediaCard } from "@/app/admin/media/_components/MediaCard";
import { createMediaFolder, deleteMediaFolder, getMediaGalleryPage, uploadMedia } from "@/features/media/media.action";
import { Button } from "@/shared/components/Button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { StatusMessage } from "@/shared/components/StatusMessage";

type Media = {
	createdAt: string;
	fileName: string;
	folderId: string | null;
	id: string;
	mimeType: string;
	size: number;
	url: string;
};

type MediaFolder = { id: string; name: string };

type MediaManagerProps = {
	folders: (MediaFolder & { mediaCount: number })[];
	gallery: { currentPage: number; media: Media[]; totalPages: number };
};

export function MediaManager({ folders, gallery: initialGallery }: MediaManagerProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
	const [fields, setFields] = useState<Record<string, string>>({});
	const [folderFields, setFolderFields] = useState<Record<string, string>>({});
	const [folderName, setFolderName] = useState("");
	const [folderToDelete, setFolderToDelete] = useState<MediaFolder | null>(null);
	const [gallery, setGallery] = useState(initialGallery);
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [isDeletingFolder, setIsDeletingFolder] = useState(false);
	const [isFolderFormOpen, setIsFolderFormOpen] = useState(false);
	const [isLoadingGallery, setIsLoadingGallery] = useState(false);
	const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
	const activeFolder = folders.find((folder) => folder.id === activeFolderId) ?? null;
	const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number } | null>(null);
	const sortedFolders = [...folders].sort((firstFolder, secondFolder) =>
		firstFolder.name.localeCompare(secondFolder.name, "id", { sensitivity: "base" }),
	);

	async function loadGallery(folderId: string | null, page: number) {
		setActiveFolderId(folderId);
		setIsLoadingGallery(true);
		try {
			const result = await getMediaGalleryPage({ folderId, page });
			if ("error" in result) return;

			setGallery(result.data);
		} finally {
			setIsLoadingGallery(false);
		}
	}

	async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const fileInput = event.currentTarget;
		const files = Array.from(fileInput.files ?? []);
		if (files.length === 0) return;

		setFields({});
		setMessage(null);
		setUploadProgress({ completed: 0, total: files.length });
		const uploadErrors: string[] = [];
		let uploadedCount = 0;
		try {
			for (const [index, file] of files.entries()) {
				const formData = new FormData();
				formData.set("file", file);
				formData.set("folderId", activeFolderId ?? "");
				const result = await uploadMedia(formData);
				if ("error" in result) {
					const errorMessage =
						("fields" in result.error ? Object.values(result.error.fields)[0] : result.error.message) ??
						"Gagal mengunggah gambar.";
					uploadErrors.push(`${file.name}: ${errorMessage}`);
				} else {
					uploadedCount += 1;
				}
				setUploadProgress({ completed: index + 1, total: files.length });
			}

			if (uploadErrors.length > 0) {
				setFields({ file: uploadErrors.join(" ") });
			}
			if (uploadedCount > 0) {
				setMessage({ text: `${uploadedCount} gambar berhasil diunggah.`, type: "success" });
				await loadGallery(activeFolderId, 1);
				router.refresh();
			}
		} finally {
			fileInput.value = "";
			setUploadProgress(null);
		}
	}

	async function handleCreateFolder(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFolderFields({});
		setIsCreatingFolder(true);
		try {
			const result = await createMediaFolder({ name: folderName });
			if ("error" in result) {
				setFolderFields("fields" in result.error ? result.error.fields : { _form: result.error.message });
				return;
			}

			setFolderName("");
			setIsFolderFormOpen(false);
			setMessage({ text: "Folder dibuat.", type: "success" });
			router.refresh();
		} finally {
			setIsCreatingFolder(false);
		}
	}

	function handleDeleted() {
		setMessage({ text: "Gambar terhapus.", type: "success" });
		void loadGallery(activeFolderId, gallery.currentPage);
		router.refresh();
	}

	function handleDeleteError(errorMessage: string) {
		setMessage({ text: errorMessage, type: "error" });
	}

	async function handleDeleteFolder() {
		if (!folderToDelete || isDeletingFolder) return;

		setIsDeletingFolder(true);
		try {
			const result = await deleteMediaFolder(folderToDelete.id);
			if ("error" in result) {
				setMessage({ text: result.error.message, type: "error" });
				return;
			}

			setMessage({ text: "Folder terhapus.", type: "success" });
			router.refresh();
		} finally {
			setFolderToDelete(null);
			setIsDeletingFolder(false);
		}
	}

	return (
		<section>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Media</h1>
					{activeFolder ? (
						<div className="mt-2 flex items-center gap-2 text-sm text-text-mute">
							<button type="button" className="hover:text-text" onClick={() => setActiveFolderId(null)}>
								Media
							</button>
							<span aria-hidden="true">/</span>
							<span className="text-text">{activeFolder.name}</span>
						</div>
					) : null}
				</div>
				<div className="flex flex-wrap gap-2">
					{!activeFolder ? (
						<Button type="button" variant="secondary" onClick={() => setIsFolderFormOpen((value) => !value)}>
							+ Buat Folder
						</Button>
					) : null}
					<Button type="button" onClick={() => fileInputRef.current?.click()}>
						+ Unggah Gambar
					</Button>
				</div>
			</div>
			{isFolderFormOpen ? (
				<form
					onSubmit={handleCreateFolder}
					className="mt-6 flex flex-wrap items-start gap-3 rounded-xl border border-border bg-canvas p-4"
				>
					<div className="min-w-52 flex-1">
						<label htmlFor="folder-name" className="sr-only">
							Nama folder
						</label>
						<input
							id="folder-name"
							value={folderName}
							onChange={(event) => setFolderName(event.target.value)}
							placeholder="Nama folder"
							disabled={isCreatingFolder}
							className="w-full rounded-md border border-border bg-canvas px-3 py-2.5 outline-none focus:border-accent"
						/>
						{folderFields.name ? <p className="mt-2 text-danger text-sm">{folderFields.name}</p> : null}
					</div>
					<Button type="submit" isLoading={isCreatingFolder}>
						Buat Folder
					</Button>
					{folderFields._form ? <StatusMessage message={folderFields._form} type="error" /> : null}
				</form>
			) : null}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				multiple
				aria-label="Pilih gambar untuk diunggah"
				className="sr-only"
				onChange={handleFileChange}
			/>
			{message ? <StatusMessage message={message.text} type={message.type} /> : null}
			{fields.file ? <StatusMessage message={fields.file} type="error" /> : null}
			{fields.folderId ? <StatusMessage message={fields.folderId} type="error" /> : null}
			{fields._form ? <StatusMessage message={fields._form} type="error" /> : null}
			{activeFolder ? (
				<FolderContents
					folderName={activeFolder.name}
					uploadProgress={uploadProgress}
					media={gallery.media}
					onDeleteError={handleDeleteError}
					onDeleted={handleDeleted}
					onGoBack={() => loadGallery(null, 1)}
				/>
			) : (
				<GalleryRoot
					folders={sortedFolders}
					uploadProgress={uploadProgress}
					media={gallery.media}
					onDeleteError={handleDeleteError}
					onDeleted={handleDeleted}
					onOpenFolder={(folderId) => loadGallery(folderId, 1)}
					onRequestDeleteFolder={setFolderToDelete}
				/>
			)}
			{gallery.totalPages > 1 ? (
				<nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination media">
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
			<ConfirmDialog
				open={Boolean(folderToDelete)}
				itemName={`folder ${folderToDelete?.name ?? ""}`}
				description="Folder hanya dapat dihapus saat tidak memiliki gambar. Tindakan ini tidak bisa dibatalkan."
				onCancel={() => setFolderToDelete(null)}
				onConfirm={handleDeleteFolder}
			/>
		</section>
	);
}

function GalleryRoot({
	folders,
	uploadProgress,
	media,
	onDeleteError,
	onDeleted,
	onOpenFolder,
	onRequestDeleteFolder,
}: {
	folders: (MediaFolder & { mediaCount: number })[];
	uploadProgress: { completed: number; total: number } | null;
	media: Media[];
	onDeleteError: (message: string) => void;
	onDeleted: () => void;
	onOpenFolder: (folderId: string) => void;
	onRequestDeleteFolder: (folder: MediaFolder) => void;
}) {
	return (
		<div className="mt-8 space-y-10">
			{folders.length > 0 ? (
				<section>
					<h2 className="font-semibold text-xl">Folder</h2>
					<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
						{folders.map((folder) => (
							<FolderCard
								key={folder.id}
								folder={folder}
								mediaCount={folder.mediaCount}
								onOpen={onOpenFolder}
								onRequestDelete={onRequestDeleteFolder}
							/>
						))}
					</div>
				</section>
			) : null}
			<MediaGrid
				emptyMessage={folders.length === 0 ? "Belum ada gambar. Unggah yang pertama." : "Belum ada gambar di galeri utama."}
				uploadProgress={uploadProgress}
				media={media}
				onDeleteError={onDeleteError}
				onDeleted={onDeleted}
			/>
		</div>
	);
}

function FolderCard({
	folder,
	mediaCount,
	onOpen,
	onRequestDelete,
}: {
	folder: MediaFolder;
	mediaCount: number;
	onOpen: (folderId: string) => void;
	onRequestDelete: (folder: MediaFolder) => void;
}) {
	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => onOpen(folder.id)}
				className="flex w-full flex-col items-center gap-2 rounded-md p-2 text-center transition-colors hover:bg-surface hover:text-accent"
			>
				<FaFolder className="text-3xl" aria-hidden="true" />
				<span className="line-clamp-2 break-words font-medium">{folder.name}</span>
			</button>
			{mediaCount === 0 ? (
				<button
					type="button"
					aria-label={`Hapus folder ${folder.name}`}
					onClick={() => onRequestDelete(folder)}
					className="absolute top-2 right-2 grid size-8 place-items-center rounded-md border border-border bg-canvas text-danger hover:border-danger"
				>
					<FaTrash aria-hidden="true" />
				</button>
			) : null}
		</div>
	);
}

function FolderContents({
	folderName,
	uploadProgress,
	media,
	onDeleteError,
	onDeleted,
	onGoBack,
}: {
	folderName: string;
	uploadProgress: { completed: number; total: number } | null;
	media: Media[];
	onDeleteError: (message: string) => void;
	onDeleted: () => void;
	onGoBack: () => void;
}) {
	return (
		<div className="mt-8">
			<Button type="button" variant="secondary" onClick={onGoBack}>
				← Kembali ke Media
			</Button>
			<MediaGrid
				emptyMessage={`Folder ${folderName} belum memiliki gambar.`}
				uploadProgress={uploadProgress}
				media={media}
				onDeleteError={onDeleteError}
				onDeleted={onDeleted}
			/>
		</div>
	);
}

function MediaGrid({
	emptyMessage,
	uploadProgress,
	media,
	onDeleteError,
	onDeleted,
}: {
	emptyMessage: string;
	uploadProgress: { completed: number; total: number } | null;
	media: Media[];
	onDeleteError: (message: string) => void;
	onDeleted: () => void;
}) {
	if (media.length === 0 && !uploadProgress) {
		return <p className="mt-4 text-sm text-text-mute">{emptyMessage}</p>;
	}

	return (
		<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
			{uploadProgress ? (
				<div className="aspect-square animate-pulse rounded-xl border border-border bg-surface p-4">
					<span className="text-sm text-text-mute">
						Mengunggah {uploadProgress.completed} dari {uploadProgress.total}…
					</span>
				</div>
			) : null}
			{media.map((item) => (
				<MediaCard key={item.id} media={item} onDeleted={onDeleted} onDeleteError={onDeleteError} />
			))}
		</div>
	);
}
