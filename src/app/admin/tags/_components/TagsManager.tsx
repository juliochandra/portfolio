"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FaCheck, FaMagnifyingGlass, FaPlus, FaTrash, FaXmark } from "react-icons/fa6";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { createTag, deleteTag, updateTag } from "@/features/tags/tags.action";
import { createTagSchema, updateTagSchema } from "@/features/tags/tags.schema";
import { validateWithZod } from "@/lib/validation/zod";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

type Tag = {
	id: string;
	name: string;
};

type TagsManagerProps = {
	initialTags: Tag[];
};

const inputClassName = "w-full rounded-md border border-border bg-canvas px-3 py-3 outline-none focus:border-accent";
const deletionDescription = "Project/Tulisan yang memakainya tidak ikut terhapus, hanya kehilangan tag ini.";

export function TagsManager({ initialTags }: TagsManagerProps) {
	const router = useRouter();
	const [editingTag, setEditingTag] = useState<Tag | null>(null);
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTagFormOpen, setIsTagFormOpen] = useState(false);
	const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
	const sortedTags = [...initialTags].sort((firstTag, secondTag) => firstTag.name.localeCompare(secondTag.name, "id"));
	const visibleTags = sortedTags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));

	function openCreateTag() {
		setEditingTag(null);
		setFields({});
		setIsTagFormOpen(true);
	}

	function openEditTag(tag: Tag) {
		setEditingTag(tag);
		setFields({});
		setIsTagFormOpen(true);
	}

	function closeTagForm() {
		if (isSubmitting) return;

		setEditingTag(null);
		setFields({});
		setIsTagFormOpen(false);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const name = new FormData(event.currentTarget).get("name")?.toString() ?? "";
		const input = { name };
		const validation = validateWithZod(editingTag ? updateTagSchema : createTagSchema, input);

		if (!validation.success) {
			setFields(validation.fields);
			return;
		}

		setFields({});
		setIsSubmitting(true);
		try {
			const result = editingTag ? await updateTag(editingTag.id, input) : await createTag(input);
			if ("error" in result) {
				setFields("fields" in result.error ? result.error.fields : { _form: result.error.message });
				return;
			}

			setEditingTag(null);
			setIsTagFormOpen(false);
			setMessage({ text: "Tag tersimpan.", type: "success" });
			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete() {
		if (!tagToDelete) return;

		const result = await deleteTag(tagToDelete.id);
		if ("error" in result) {
			setMessage({ text: result.error.message, type: "error" });
			return;
		}

		if (editingTag?.id === tagToDelete.id) {
			setEditingTag(null);
			setFields({});
			setIsTagFormOpen(false);
		}
		setTagToDelete(null);
		setMessage({ text: "Tag terhapus.", type: "success" });
		router.refresh();
	}

	return (
		<section className="w-full">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Tags</h1>
					<p className="mt-1 text-sm text-text-mute">{initialTags.length} tag tersedia</p>
				</div>
				<Button
					className="inline-flex items-center gap-2"
					icon={<FaPlus aria-hidden="true" />}
					onClick={openCreateTag}
					type="button"
				>
					Tambah Tag
				</Button>
			</div>
			{message ? <StatusMessage message={message.text} type={message.type} /> : null}
			<div className="mt-8 rounded-xl border border-border bg-canvas p-4 sm:p-5">
				<label className="sr-only" htmlFor="tag-search">
					Cari tag
				</label>
				<div className="relative">
					<FaMagnifyingGlass className="-translate-y-1/2 absolute top-1/2 left-3 text-text-mute" aria-hidden="true" />
					<input
						className="w-full rounded-md border border-border bg-surface py-3 pr-3 pl-10 outline-none focus:border-accent"
						id="tag-search"
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Cari tag"
						value={searchQuery}
					/>
				</div>
				{initialTags.length === 0 ? (
					<p className="mt-6 rounded-lg border border-border border-dashed bg-surface p-6 text-center text-sm text-text-mute">
						Belum ada tag. Tambahkan tag pertama Anda.
					</p>
				) : null}
				{initialTags.length > 0 && visibleTags.length === 0 ? (
					<p className="mt-6 text-center text-sm text-text-mute">Tag tidak ditemukan.</p>
				) : null}
				{visibleTags.length > 0 ? (
					<ul className="mt-5 flex flex-wrap gap-2" aria-label="Daftar tag">
						{visibleTags.map((tag) => (
							<li key={tag.id}>
								<button
									className="rounded-md border border-border bg-surface px-3 py-2 font-medium text-sm transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
									onClick={() => openEditTag(tag)}
									type="button"
								>
									{tag.name.toLowerCase()}
								</button>
							</li>
						))}
					</ul>
				) : null}
			</div>
			{isTagFormOpen ? (
				<TagFormDialog
					editingTag={editingTag}
					error={fields.name ?? fields._form}
					isSubmitting={isSubmitting}
					onCancel={closeTagForm}
					onDelete={
						editingTag
							? () => {
									setIsTagFormOpen(false);
									setTagToDelete(editingTag);
								}
							: undefined
					}
					onSubmit={handleSubmit}
				/>
			) : null}
			<ConfirmDialog
				description={deletionDescription}
				itemName={`tag '${tagToDelete?.name ?? ""}'`}
				onCancel={() => setTagToDelete(null)}
				onConfirm={handleDelete}
				open={Boolean(tagToDelete)}
			/>
		</section>
	);
}

function TagFormDialog({
	editingTag,
	error,
	isSubmitting,
	onCancel,
	onDelete,
	onSubmit,
}: {
	editingTag: Tag | null;
	error: string | undefined;
	isSubmitting: boolean;
	onCancel: () => void;
	onDelete?: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
	const title = editingTag ? "Ubah Tag" : "Tambah Tag";

	return (
		<div aria-label={title} aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-5" role="dialog">
			<button aria-label="Tutup form tag" className="absolute inset-0 bg-black/50" onClick={onCancel} type="button" />
			<form
				key={editingTag?.id ?? "new"}
				onSubmit={onSubmit}
				className="relative w-full max-w-md rounded-xl border border-border bg-canvas p-5 shadow-xl sm:p-6"
			>
				<div className="flex items-center justify-between gap-4">
					<h2 className="font-bold text-xl">{title}</h2>
					<button
						aria-label="Tutup form tag"
						className="grid size-9 place-items-center rounded-md text-text-mute hover:bg-surface hover:text-text"
						disabled={isSubmitting}
						onClick={onCancel}
						type="button"
					>
						<FaXmark aria-hidden="true" />
					</button>
				</div>
				<div className="mt-6">
					<FormField error={error} label="Nama tag" required>
						<input
							aria-label="Nama tag"
							className={inputClassName}
							defaultValue={editingTag?.name}
							disabled={isSubmitting}
							name="name"
						/>
					</FormField>
				</div>
				<div className="mt-8 flex flex-wrap items-center justify-between gap-3">
					{onDelete ? (
						<Button
							className="inline-flex items-center gap-2"
							disabled={isSubmitting}
							icon={<FaTrash aria-hidden="true" />}
							onClick={onDelete}
							type="button"
							variant="danger"
						>
							Hapus
						</Button>
					) : null}
					<div className="ml-auto flex items-center gap-3">
						<Button
							className="inline-flex items-center gap-2"
							icon={<FaCheck aria-hidden="true" />}
							isLoading={isSubmitting}
							type="submit"
						>
							Simpan
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
