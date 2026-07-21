"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { createProject, updateProject } from "@/features/projects/projects.action";
import { createProjectSchema, projectFormDataToInput, updateProjectSchema } from "@/features/projects/projects.schema";
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

type ProjectFormProject = {
	content: string;
	demoUrl: string | null;
	description: string | null;
	id: string;
	repositoryUrl: string | null;
	skillIds: string[];
	status: PublishStatus;
	tagIds: string[];
	thumbnailImage: string | null;
	title: string;
};

type ProjectFormProps = {
	media: MediaOption[];
	project?: ProjectFormProject;
	skills: { id: string; name: string }[];
	tags: { id: string; name: string }[];
};

const inputClassName = "w-full rounded-md border border-border bg-canvas px-3 py-3 outline-none focus:border-accent";

export function ProjectForm({ media, project, skills, tags }: ProjectFormProps) {
	const router = useRouter();
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditing = Boolean(project);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const validation = validateWithZod(
			isEditing ? updateProjectSchema : createProjectSchema,
			projectFormDataToInput(formData),
		);

		if (!validation.success) {
			setFields(validation.fields);
			return;
		}

		setFields({});
		setIsSubmitting(true);
		try {
			const result = project ? await updateProject(project.id, formData) : await createProject(formData);
			if ("error" in result) {
				setFields("fields" in result.error ? result.error.fields : { _form: result.error.message });
				return;
			}

			router.push("/admin/projects?message=saved");
			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="max-w-4xl">
			<BackLink href="/admin/projects" label="Kembali ke Project" />
			<h1 className="mt-5 font-bold text-3xl tracking-tight">{isEditing ? "Ubah Project" : "Tambah Project"}</h1>
			{fields._form ? <StatusMessage message={fields._form} type="error" /> : null}
			<form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-xl border border-border bg-canvas p-5 sm:p-8">
				<FormField label="Nama project" required error={fields.title}>
					<input
						name="title"
						aria-label="Nama project"
						defaultValue={project?.title}
						disabled={isSubmitting}
						className={inputClassName}
					/>
				</FormField>
				<FormField label="Gambaran singkat" required error={fields.description}>
					<textarea
						name="description"
						aria-label="Gambaran singkat"
						defaultValue={project?.description ?? ""}
						disabled={isSubmitting}
						rows={3}
						className={inputClassName}
					/>
				</FormField>
				<FormField label="Deskripsi lengkap" required error={fields.content}>
					<textarea
						name="content"
						aria-label="Deskripsi lengkap"
						defaultValue={project?.content}
						disabled={isSubmitting}
						rows={8}
						className={inputClassName}
					/>
				</FormField>
				<div className="grid gap-6 sm:grid-cols-2">
					<FormField label="Tautan demo" error={fields.demoUrl}>
						<input
							name="demoUrl"
							aria-label="Tautan demo"
							type="url"
							defaultValue={project?.demoUrl ?? ""}
							disabled={isSubmitting}
							className={inputClassName}
						/>
					</FormField>
					<FormField label="Tautan kode" error={fields.repositoryUrl}>
						<input
							name="repositoryUrl"
							aria-label="Tautan kode"
							type="url"
							defaultValue={project?.repositoryUrl ?? ""}
							disabled={isSubmitting}
							className={inputClassName}
						/>
					</FormField>
				</div>
				<FormField label="Gambar dari galeri Media" error={fields.thumbnailImage}>
					<select
						name="thumbnailImage"
						aria-label="Gambar dari galeri Media"
						defaultValue={project?.thumbnailImage ?? ""}
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
				<div className="grid gap-6 sm:grid-cols-2">
					<FormField label="Keahlian / Tech Stack" error={fields.skillIds}>
						<select
							multiple
							name="skillIds"
							aria-label="Keahlian / Tech Stack"
							defaultValue={project?.skillIds}
							disabled={isSubmitting}
							className={`${inputClassName} min-h-36`}
						>
							{skills.map((skill) => (
								<option key={skill.id} value={skill.id}>
									{skill.name}
								</option>
							))}
						</select>
					</FormField>
					<FormField label="Tag" error={fields.tagIds}>
						<select
							multiple
							name="tagIds"
							aria-label="Tag"
							defaultValue={project?.tagIds}
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
				</div>
				<FormField label="Status" error={fields.status}>
					<StatusSelect name="status" aria-label="Status" defaultValue={project?.status} disabled={isSubmitting} />
				</FormField>
				<Button type="submit" isLoading={isSubmitting}>
					Simpan
				</Button>
			</form>
		</section>
	);
}
