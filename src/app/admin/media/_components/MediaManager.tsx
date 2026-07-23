"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { FaFolder } from "react-icons/fa6";
import { MediaCard } from "@/app/admin/media/_components/MediaCard";
import { createMediaFolder, uploadMedia } from "@/features/media/media.action";
import { Button } from "@/shared/components/Button";
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
	folders: MediaFolder[];
	media: Media[];
};

export function MediaManager({ folders, media }: MediaManagerProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
	const [fields, setFields] = useState<Record<string, string>>({});
	const [folderFields, setFolderFields] = useState<Record<string, string>>({});
	const [folderName, setFolderName] = useState("");
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [isFolderFormOpen, setIsFolderFormOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
	const activeFolder = folders.find((folder) => folder.id === activeFolderId) ?? null;
	const visibleMedia = media.filter((item) => item.folderId === activeFolderId);

	async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const fileInput = event.currentTarget;
		const file = fileInput.files?.[0];
		if (!file) return;

		setFields({});
		setMessage(null);
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.set("file", file);
			formData.set("folderId", activeFolderId ?? "");
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
		router.refresh();
	}

	function handleDeleteError(errorMessage: string) {
		setMessage({ text: errorMessage, type: "error" });
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
					isUploading={isUploading}
					media={visibleMedia}
					onDeleteError={handleDeleteError}
					onDeleted={handleDeleted}
					onGoBack={() => setActiveFolderId(null)}
				/>
			) : (
				<GalleryRoot
					folders={folders}
					isUploading={isUploading}
					media={visibleMedia}
					onDeleteError={handleDeleteError}
					onDeleted={handleDeleted}
					onOpenFolder={setActiveFolderId}
				/>
			)}
		</section>
	);
}

function GalleryRoot({
	folders,
	isUploading,
	media,
	onDeleteError,
	onDeleted,
	onOpenFolder,
}: {
	folders: MediaFolder[];
	isUploading: boolean;
	media: Media[];
	onDeleteError: (message: string) => void;
	onDeleted: () => void;
	onOpenFolder: (folderId: string) => void;
}) {
	return (
		<div className="mt-8 space-y-10">
			{folders.length > 0 ? (
				<section>
					<h2 className="font-semibold text-xl">Folder</h2>
					<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
						{folders.map((folder) => (
							<button
								key={folder.id}
								type="button"
								onClick={() => onOpenFolder(folder.id)}
								className="flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface p-4 text-center transition-colors hover:border-accent hover:text-accent"
							>
								<FaFolder className="text-4xl" aria-hidden="true" />
								<span className="line-clamp-2 break-words font-medium">{folder.name}</span>
							</button>
						))}
					</div>
				</section>
			) : null}
			<MediaGrid
				emptyMessage={folders.length === 0 ? "Belum ada gambar. Unggah yang pertama." : "Belum ada gambar di galeri utama."}
				isUploading={isUploading}
				media={media}
				onDeleteError={onDeleteError}
				onDeleted={onDeleted}
			/>
		</div>
	);
}

function FolderContents({
	folderName,
	isUploading,
	media,
	onDeleteError,
	onDeleted,
	onGoBack,
}: {
	folderName: string;
	isUploading: boolean;
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
				isUploading={isUploading}
				media={media}
				onDeleteError={onDeleteError}
				onDeleted={onDeleted}
			/>
		</div>
	);
}

function MediaGrid({
	emptyMessage,
	isUploading,
	media,
	onDeleteError,
	onDeleted,
}: {
	emptyMessage: string;
	isUploading: boolean;
	media: Media[];
	onDeleteError: (message: string) => void;
	onDeleted: () => void;
}) {
	if (media.length === 0 && !isUploading) {
		return <p className="mt-4 text-sm text-text-mute">{emptyMessage}</p>;
	}

	return (
		<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
			{isUploading ? (
				<div className="aspect-square animate-pulse rounded-xl border border-border bg-surface p-4">
					<span className="text-sm text-text-mute">Mengunggah…</span>
				</div>
			) : null}
			{media.map((item) => (
				<MediaCard key={item.id} media={item} onDeleted={onDeleted} onDeleteError={onDeleteError} />
			))}
		</div>
	);
}
