"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FaImage } from "react-icons/fa";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { createProject, updateProject } from "@/features/projects/projects.action";
import { createProjectSchema, projectFormDataToInput, updateProjectSchema } from "@/features/projects/projects.schema";
import { emptyRichTextDocument, parseRichTextDocument } from "@/lib/tiptap/json";
import { isImageUrl } from "@/lib/validation/is-image-url";
import { validateWithZod } from "@/lib/validation/zod";
import { BackLink } from "@/shared/components/BackLink";
import { type MediaImagePickerItem, MediaImagePickerModal } from "@/shared/components/MediaImagePickerModal";
import { getSkillIcon } from "@/shared/components/SkillTag";
import { StatusSelect } from "@/shared/components/StatusSelect";
import type { PublishStatus } from "@/shared/publish-status";

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
	folders: { id: string; name: string }[];
	media: MediaImagePickerItem[];
	mediaCurrentPage?: number;
	mediaTotalPages?: number;
	project?: ProjectFormProject;
	skills: { icon: string | null; id: string; name: string }[];
	tags: { id: string; name: string }[];
};

const inputClassName = "w-full rounded-md border border-border bg-canvas px-3 py-3 outline-none focus:border-accent";

export function ProjectForm({
	folders,
	media,
	mediaCurrentPage = 1,
	mediaTotalPages = 1,
	project,
	skills,
	tags,
}: ProjectFormProps) {
	const router = useRouter();
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
	const [selectedSkillIds, setSelectedSkillIds] = useState(project?.skillIds ?? []);
	const [selectedTagIds, setSelectedTagIds] = useState(project?.tagIds ?? []);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [thumbnailImage, setThumbnailImage] = useState(project?.thumbnailImage ?? "");
	const isEditing = Boolean(project);
	const sortedSkills = [...skills].sort((firstSkill, secondSkill) => firstSkill.name.localeCompare(secondSkill.name, "id"));
	const sortedTags = [...tags].sort((firstTag, secondTag) => firstTag.name.localeCompare(secondTag.name, "id"));

	function toggleSkill(skillId: string) {
		setSelectedSkillIds((currentSkillIds) =>
			currentSkillIds.includes(skillId)
				? currentSkillIds.filter((currentSkillId) => currentSkillId !== skillId)
				: [...currentSkillIds, skillId],
		);
	}

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
		const validation = validateWithZod(
			isEditing ? updateProjectSchema : createProjectSchema,
			projectFormDataToInput(formData),
		);

		if (!validation.success) {
			setSuccessMessage(null);
			setFields(validation.fields);
			return;
		}

		setFields({});
		setSuccessMessage(null);
		setIsSubmitting(true);
		try {
			const result = project ? await updateProject(project.id, formData) : await createProject(formData);
			if ("error" in result) {
				setFields("fields" in result.error ? result.error.fields : { _form: result.error.message });
				return;
			}

			if (!project) {
				router.replace(`/admin/projects/${result.data.id}`);
				return;
			}

			setSuccessMessage("Project tersimpan.");
			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="w-full">
			<BackLink href="/admin/projects" label="Kembali ke Project" />
			<h1 className="mt-5 font-bold text-3xl tracking-tight">{isEditing ? "Ubah Project" : "Tambah Project"}</h1>
			{fields._form ? <StatusMessage message={fields._form} type="error" /> : null}
			{successMessage ? <StatusMessage message={successMessage} type="success" /> : null}
			<form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-xl border border-border bg-canvas p-5 sm:p-8">
				<FormField label="Nama project" required error={fields.title}>
					<input
						aria-label="Nama project"
						className={inputClassName}
						defaultValue={project?.title}
						disabled={isSubmitting}
						name="title"
					/>
				</FormField>
				<FormField label="Deskripsi" required error={fields.description}>
					<textarea
						aria-label="Deskripsi"
						className={inputClassName}
						defaultValue={project?.description ?? ""}
						disabled={isSubmitting}
						name="description"
						rows={3}
					/>
				</FormField>
				<div className="grid gap-6 sm:grid-cols-2">
					<FormField label="Tautan demo" error={fields.demoUrl}>
						<input
							aria-label="Tautan demo"
							className={inputClassName}
							defaultValue={project?.demoUrl ?? ""}
							disabled={isSubmitting}
							name="demoUrl"
							type="url"
						/>
					</FormField>
					<FormField label="Tautan kode" error={fields.repositoryUrl}>
						<input
							aria-label="Tautan kode"
							className={inputClassName}
							defaultValue={project?.repositoryUrl ?? ""}
							disabled={isSubmitting}
							name="repositoryUrl"
							type="url"
						/>
					</FormField>
				</div>
				<FormField label="Gambar Sampul" error={fields.thumbnailImage}>
					<div>
						<input name="thumbnailImage" type="hidden" value={thumbnailImage} />
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
											alt="Pratinjau gambar sampul"
											className="mx-auto max-w-full rounded-md object-contain"
											src={thumbnailImage}
										/>
									</div>
									<div>
										<p className="font-medium">Gambar sampul dipilih</p>
										<p className="mt-1 text-sm text-text-mute">
											Gambar ini akan tampil di bagian atas detail project dan kartu portfolio. Klik untuk mengganti
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
										<p className="mt-1 text-sm text-text-mute">Pilih gambar dari galeri Media untuk project ini.</p>
									</div>
								</div>
							)}
						</button>
					</div>
				</FormField>
				<FormField label="Tech Stack" error={fields.skillIds}>
					<fieldset aria-label="Tech Stack" className="flex flex-wrap gap-2">
						{selectedSkillIds.map((skillId) => (
							<input key={skillId} name="skillIds" type="hidden" value={skillId} />
						))}
						{sortedSkills.map((skill) => {
							const isSelected = selectedSkillIds.includes(skill.id);
							return (
								<button
									aria-pressed={isSelected}
									className={`rounded-md border px-3 py-2 text-sm transition-colors ${
										isSelected
											? "border-accent bg-accent/10 text-accent"
											: "border-border bg-canvas text-text-mute hover:border-accent hover:text-text"
									}`}
									disabled={isSubmitting}
									key={skill.id}
									onClick={() => toggleSkill(skill.id)}
									type="button"
								>
									<TechStackIcon icon={skill.icon} />
									{skill.name}
								</button>
							);
						})}
						{skills.length === 0 ? <p className="text-sm text-text-mute">Belum ada tech stack.</p> : null}
					</fieldset>
				</FormField>
				<FormField label="Tag" error={fields.tagIds}>
					<fieldset aria-label="Tag" className="flex flex-wrap gap-2">
						{selectedTagIds.map((tagId) => (
							<input key={tagId} name="tagIds" type="hidden" value={tagId} />
						))}
						{sortedTags.map((tag) => {
							const isSelected = selectedTagIds.includes(tag.id);
							return (
								<button
									aria-pressed={isSelected}
									className={`rounded-md border px-3 py-2 text-sm transition-colors ${
										isSelected
											? "border-accent bg-accent/10 text-accent"
											: "border-border bg-canvas text-text-mute hover:border-accent hover:text-text"
									}`}
									disabled={isSubmitting}
									key={tag.id}
									onClick={() => toggleTag(tag.id)}
									type="button"
								>
									{tag.name.toLowerCase()}
								</button>
							);
						})}
						{tags.length === 0 ? <p className="text-sm text-text-mute">Belum ada tag.</p> : null}
					</fieldset>
				</FormField>
				<FormField label="Status" error={fields.status}>
					<StatusSelect aria-label="Status" defaultValue={project?.status} disabled={isSubmitting} name="status" />
				</FormField>
				<FormField label="Deskripsi lengkap" required error={fields.content}>
					<RichTextEditor
						disabled={isSubmitting}
						folders={folders}
						initialContent={
							project ? (parseRichTextDocument(project.content) ?? emptyRichTextDocument) : emptyRichTextDocument
						}
						label="Deskripsi lengkap"
						media={media}
						mediaCurrentPage={mediaCurrentPage}
						mediaTotalPages={mediaTotalPages}
						name="content"
					/>
				</FormField>
				<Button isLoading={isSubmitting} type="submit">
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

function TechStackIcon({ icon }: { icon: string | null }) {
	const Icon = getSkillIcon(icon);

	if (isImageUrl(icon)) {
		return (
			// biome-ignore lint/performance/noImgElement: URL gambar dipilih dari galeri Media yang dikelola admin.
			<img src={icon} alt="" className="mr-1 inline-block size-4 object-contain" />
		);
	}

	return Icon ? <Icon className="mr-1 inline-block" aria-hidden="true" /> : null;
}
