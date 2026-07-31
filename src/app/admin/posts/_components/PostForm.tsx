"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FaImage } from "react-icons/fa";
import { createPost, updatePost } from "@/features/posts/posts.action";
import { createPostSchema, postFormDataToInput, updatePostSchema } from "@/features/posts/posts.schema";
import { validateWithZod } from "@/lib/validation/zod";
import { BackLink } from "@/shared/components/BackLink";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/FormField";
import { type MediaImagePickerItem, MediaImagePickerModal } from "@/shared/components/MediaImagePickerModal";
import { RichTextEditor } from "@/shared/components/RichTextEditor";
import { StatusMessage } from "@/shared/components/StatusMessage";
import { StatusSelect } from "@/shared/components/StatusSelect";
import type { PublishStatus } from "@/shared/publish-status";
import { emptyRichTextDocument, parseRichTextDocument } from "@/shared/tiptap/json";

type PostFormPost = {
	content: string;
	description: string | null;
	id: string;
	status: PublishStatus;
	tagIds: string[];
	thumbnailImage: string | null;
	title: string;
};

type PostFormProps = {
	folders: { id: string; name: string }[];
	media: MediaImagePickerItem[];
	mediaCurrentPage?: number;
	mediaTotalPages?: number;
	post?: PostFormPost;
	tags: { id: string; name: string }[];
};

const inputClassName = "w-full rounded-md border border-border bg-canvas px-3 py-3 outline-none focus:border-accent";

export function PostForm({ folders, media, mediaCurrentPage = 1, mediaTotalPages = 1, post, tags }: PostFormProps) {
	const router = useRouter();
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
	const [selectedTagIds, setSelectedTagIds] = useState(post?.tagIds ?? []);
	const [thumbnailImage, setThumbnailImage] = useState(post?.thumbnailImage ?? "");
	const isEditing = Boolean(post);
	const sortedTags = [...tags].sort((firstTag, secondTag) => firstTag.name.localeCompare(secondTag.name, "id"));

	function toggleTag(tagId: string) {
		setSelectedTagIds((currentTagIds) =>
			currentTagIds.includes(tagId)
				? currentTagIds.filter((currentTagId) => currentTagId !== tagId)
				: [...currentTagIds, tagId],
		);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const input = postFormDataToInput(formData);
		const validation = validateWithZod(isEditing ? updatePostSchema : createPostSchema, input);

		if (!validation.success) {
			setSuccessMessage(null);
			setFields(validation.fields);
			return;
		}

		setFields({});
		setSuccessMessage(null);
		setIsSubmitting(true);
		try {
			const result = post ? await updatePost(post.id, input) : await createPost(input);
			if ("error" in result) {
				setFields("fields" in result.error ? result.error.fields : { _form: result.error.message });
				return;
			}

			if (!post) {
				router.replace(`/admin/posts/${result.data.id}`);
				return;
			}

			setSuccessMessage("Tulisan tersimpan.");
			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="w-full">
			<BackLink href="/admin/posts" label="Kembali ke Tulisan" />
			<h1 className="mt-5 font-bold text-3xl tracking-tight">{isEditing ? "Ubah Tulisan" : "Tulis Tulisan"}</h1>
			{fields._form ? <StatusMessage message={fields._form} type="error" /> : null}
			{successMessage ? <StatusMessage message={successMessage} type="success" /> : null}
			<form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-xl border border-border bg-canvas p-5 sm:p-8">
				<FormField label="Judul" required error={fields.title}>
					<input
						name="title"
						aria-label="Judul"
						defaultValue={post?.title}
						disabled={isSubmitting}
						className={inputClassName}
					/>
				</FormField>
				<FormField label="Deskripsi" error={fields.description}>
					<textarea
						name="description"
						aria-label="Deskripsi"
						defaultValue={post?.description ?? ""}
						disabled={isSubmitting}
						rows={3}
						className={inputClassName}
					/>
				</FormField>
				<FormField label="Gambar Sampul" error={fields.thumbnailImage}>
					<div>
						<input type="hidden" name="thumbnailImage" value={thumbnailImage} />
						<button
							aria-label="Pilih gambar sampul"
							className="group w-full cursor-pointer rounded-xl border border-border border-dashed bg-surface/60 p-4 text-left transition-colors hover:border-accent sm:p-5"
							disabled={isSubmitting}
							onClick={() => setIsThumbnailModalOpen(true)}
							type="button"
						>
							{thumbnailImage ? (
								<div className="flex flex-col gap-5">
									<div className="w-full overflow-hidden rounded-lg border border-border bg-canvas p-1 transition-colors group-hover:border-accent">
										{/* biome-ignore lint/performance/noImgElement: URL gambar dipilih dari galeri Media yang dikelola admin. */}
										<img
											src={thumbnailImage}
											alt="Pratinjau gambar sampul"
											className="mx-auto max-w-full rounded-md object-contain"
										/>
									</div>
									<div>
										<p className="font-medium">Gambar sampul dipilih</p>
										<p className="mt-1 text-sm text-text-mute">
											Gambar ini akan tampil di bagian atas detail tulisan dan kartu blog. Klik untuk mengganti
											gambar.
										</p>
									</div>
								</div>
							) : (
								<div className="flex items-center gap-3">
									<div className="grid size-11 shrink-0 place-items-center rounded-lg bg-canvas text-text-mute">
										<FaImage aria-hidden="true" />
									</div>
									<div>
										<p className="font-medium">Belum ada gambar sampul</p>
										<p className="mt-1 text-sm text-text-mute">Pilih gambar dari galeri Media untuk tulisan ini.</p>
									</div>
								</div>
							)}
						</button>
					</div>
				</FormField>
				<FormField label="Tag" error={fields.tagIds}>
					<fieldset className="flex flex-wrap gap-2" aria-label="Tag">
						{selectedTagIds.map((tagId) => (
							<input key={tagId} type="hidden" name="tagIds" value={tagId} />
						))}
						{sortedTags.map((tag) => {
							const isSelected = selectedTagIds.includes(tag.id);
							return (
								<button
									key={tag.id}
									type="button"
									aria-pressed={isSelected}
									disabled={isSubmitting}
									onClick={() => toggleTag(tag.id)}
									className={`rounded-md border px-3 py-2 text-sm transition-colors ${
										isSelected
											? "border-accent bg-accent/10 text-accent"
											: "border-border bg-canvas text-text-mute hover:border-accent hover:text-text"
									}`}
								>
									{tag.name.toLowerCase()}
								</button>
							);
						})}
						{tags.length === 0 ? <p className="text-sm text-text-mute">Belum ada tag.</p> : null}
					</fieldset>
				</FormField>
				<FormField label="Status" error={fields.status}>
					<StatusSelect name="status" aria-label="Status" defaultValue={post?.status} disabled={isSubmitting} />
				</FormField>
				<FormField label="Isi" required error={fields.content}>
					<RichTextEditor
						disabled={isSubmitting}
						folders={folders}
						initialContent={post ? (parseRichTextDocument(post.content) ?? emptyRichTextDocument) : emptyRichTextDocument}
						label="Isi"
						media={media}
						mediaCurrentPage={mediaCurrentPage}
						mediaTotalPages={mediaTotalPages}
						name="content"
					/>
				</FormField>
				<Button type="submit" isLoading={isSubmitting}>
					Simpan
				</Button>
			</form>
			{isThumbnailModalOpen ? (
				<MediaImagePickerModal
					currentPage={mediaCurrentPage}
					folders={folders}
					media={media}
					onClear={() => setThumbnailImage("")}
					onClose={() => setIsThumbnailModalOpen(false)}
					onSelect={setThumbnailImage}
					selectedUrl={thumbnailImage}
					title="Pilih Gambar Sampul"
					totalPages={mediaTotalPages}
				/>
			) : null}
		</section>
	);
}
