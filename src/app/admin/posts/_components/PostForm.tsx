"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { createPost, updatePost } from "@/features/posts/posts.action";
import { createPostSchema, postFormDataToInput, updatePostSchema } from "@/features/posts/posts.schema";
import { BackLink } from "@/shared/components/BackLink";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/FormField";
import { StatusMessage } from "@/shared/components/StatusMessage";
import { StatusSelect } from "@/shared/components/StatusSelect";
import type { PublishStatus } from "@/shared/publish-status";
import { validateWithZod } from "@/shared/validation/zod";

type MediaOption = {
	fileName: string;
	id: string;
	url: string;
};

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
	media: MediaOption[];
	post?: PostFormPost;
	tags: { id: string; name: string }[];
};

const inputClassName = "w-full rounded-md border border-border bg-canvas px-3 py-3 outline-none focus:border-accent";

export function PostForm({ media, post, tags }: PostFormProps) {
	const router = useRouter();
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditing = Boolean(post);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const input = postFormDataToInput(formData);
		const validation = validateWithZod(isEditing ? updatePostSchema : createPostSchema, input);

		if (!validation.success) {
			setFields(validation.fields);
			return;
		}

		setFields({});
		setIsSubmitting(true);
		try {
			const result = post ? await updatePost(post.id, input) : await createPost(input);
			if ("error" in result) {
				setFields("fields" in result.error ? result.error.fields : { _form: result.error.message });
				return;
			}

			router.push("/admin/posts?message=saved");
			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="max-w-4xl">
			<BackLink href="/admin/posts" label="Kembali ke Tulisan" />
			<h1 className="mt-5 font-bold text-3xl tracking-tight">{isEditing ? "Ubah Tulisan" : "Tulis Tulisan"}</h1>
			{fields._form ? <StatusMessage message={fields._form} type="error" /> : null}
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
				<FormField label="Cuplikan" error={fields.description}>
					<textarea
						name="description"
						aria-label="Cuplikan"
						defaultValue={post?.description ?? ""}
						disabled={isSubmitting}
						rows={3}
						className={inputClassName}
					/>
				</FormField>
				<FormField label="Isi" required error={fields.content}>
					<textarea
						name="content"
						aria-label="Isi"
						defaultValue={post?.content}
						disabled={isSubmitting}
						rows={12}
						className={inputClassName}
					/>
				</FormField>
				<FormField label="Gambar Sampul" error={fields.thumbnailImage}>
					<select
						name="thumbnailImage"
						aria-label="Gambar Sampul"
						defaultValue={post?.thumbnailImage ?? ""}
						disabled={isSubmitting}
						className={inputClassName}
					>
						<option value="">Tidak menggunakan gambar</option>
						{media.map((item) => (
							<option key={item.id} value={item.url}>
								{item.fileName}
							</option>
						))}
					</select>
				</FormField>
				<FormField label="Tag" error={fields.tagIds}>
					<select
						multiple
						name="tagIds"
						aria-label="Tag"
						defaultValue={post?.tagIds}
						disabled={isSubmitting}
						className={`${inputClassName} min-h-36`}
					>
						{tags.map((tag) => (
							<option key={tag.id} value={tag.id}>
								{tag.name}
							</option>
						))}
					</select>
				</FormField>
				<FormField label="Status" error={fields.status}>
					<StatusSelect name="status" aria-label="Status" defaultValue={post?.status} disabled={isSubmitting} />
				</FormField>
				<Button type="submit" isLoading={isSubmitting}>
					Simpan
				</Button>
			</form>
		</section>
	);
}
