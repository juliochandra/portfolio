"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { createTag, deleteTag, updateTag } from "@/features/tags/tags.action";
import { createTagSchema, updateTagSchema } from "@/features/tags/tags.schema";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/FormField";
import { ManageRow } from "@/shared/components/ManageRow";
import { StatusMessage } from "@/shared/components/StatusMessage";
import { validateWithZod } from "@/shared/validation/zod";

type Tag = {
	id: string;
	name: string;
};

type TagsManagerProps = {
	initialTags: Tag[];
};

const inputClassName = "w-full rounded-md border border-border bg-canvas px-3 py-3 outline-none focus:border-accent";
const deletionDescription = "Project/Tulisan yang memakainya tidak ikut terhapus, cuma kehilangan tag ini.";

function formDataValue(form: HTMLFormElement, name: string): string {
	return new FormData(form).get(name)?.toString() ?? "";
}

export function TagsManager({ initialTags }: TagsManagerProps) {
	const router = useRouter();
	const [editingTag, setEditingTag] = useState<Tag | null>(null);
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const input = { name: formDataValue(form, "name") };
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

			form.reset();
			setEditingTag(null);
			setMessage({ text: "Tag tersimpan.", type: "success" });
			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete(tag: Tag) {
		const result = await deleteTag(tag.id);
		if ("error" in result) {
			setMessage({ text: result.error.message, type: "error" });
			return;
		}

		if (editingTag?.id === tag.id) {
			setEditingTag(null);
			setFields({});
		}
		setMessage({ text: "Tag terhapus.", type: "success" });
		router.refresh();
	}

	function startEditing(tag: Tag) {
		setFields({});
		setMessage(null);
		setEditingTag(tag);
	}

	return (
		<section>
			<h1 className="font-bold text-3xl tracking-tight">Tags</h1>
			{message ? <StatusMessage message={message.text} type={message.type} /> : null}
			<form
				key={editingTag?.id ?? "new"}
				onSubmit={handleSubmit}
				className="mt-8 space-y-6 rounded-xl border border-border bg-canvas p-5 sm:p-8"
			>
				<FormField label="Nama" required error={fields.name}>
					<input
						name="name"
						aria-label="Nama"
						defaultValue={editingTag?.name}
						disabled={isSubmitting}
						className={inputClassName}
					/>
				</FormField>
				{fields._form ? <StatusMessage message={fields._form} type="error" /> : null}
				<Button type="submit" isLoading={isSubmitting}>
					{editingTag ? "Simpan" : "+ Tambah"}
				</Button>
			</form>
			<section className="mt-10" aria-labelledby="tags-list-title">
				<h2 id="tags-list-title" className="font-semibold text-xl">
					Daftar Tag
				</h2>
				{initialTags.length === 0 ? (
					<p className="mt-4 rounded-xl border border-border bg-surface p-6 text-center text-text-mute">
						Belum ada tag. Tambahkan yang pertama.
					</p>
				) : (
					<div className="mt-4 rounded-xl border border-border bg-canvas px-5 sm:px-6">
						{initialTags.map((tag) => (
							<ManageRow
								key={tag.id}
								confirmationDescription={deletionDescription}
								itemType="tag"
								onDelete={() => handleDelete(tag)}
								onEdit={() => startEditing(tag)}
								title={tag.name}
							/>
						))}
					</div>
				)}
			</section>
		</section>
	);
}
