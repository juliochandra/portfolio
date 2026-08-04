"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { FaCheck, FaImage, FaMagnifyingGlass, FaPlus, FaTrash, FaXmark } from "react-icons/fa6";
import { type MediaImagePickerItem, MediaImagePickerModal } from "@/components/media/MediaImagePickerModal";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField } from "@/components/ui/FormField";
import { getSkillIcon } from "@/components/ui/SkillTag";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { createSkill, deleteSkill, updateSkill } from "@/features/skills/skills.action";
import { skillFormDataToInput } from "@/features/skills/skills.schema";
import type { PublicSkill } from "@/features/skills/skills.type";
import { isImageUrl } from "@/lib/validation/is-image-url";

type SkillsManagerProps = {
	folders: { id: string; name: string }[];
	initialSkills: PublicSkill[];
	media: MediaImagePickerItem[];
	mediaCurrentPage?: number;
	mediaTotalPages?: number;
};

const inputClassName = "w-full rounded-md border border-border bg-canvas px-3 py-3 outline-none focus:border-accent";
const deletionDescription = "Skill ini akan dihapus dari daftar keahlian.";

export function SkillsManager({
	folders,
	initialSkills,
	media,
	mediaCurrentPage = 1,
	mediaTotalPages = 1,
}: SkillsManagerProps) {
	const router = useRouter();
	const [editingSkill, setEditingSkill] = useState<PublicSkill | null>(null);
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isSkillFormOpen, setIsSkillFormOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [skillToDelete, setSkillToDelete] = useState<PublicSkill | null>(null);
	const sortedSkills = [...initialSkills].sort((firstSkill, secondSkill) =>
		firstSkill.name.localeCompare(secondSkill.name, "id", { sensitivity: "base" }),
	);
	const visibleSkills = sortedSkills.filter((skill) => skill.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));

	function openCreateSkill() {
		setEditingSkill(null);
		setFields({});
		setIsSkillFormOpen(true);
	}

	function openEditSkill(skill: PublicSkill) {
		setEditingSkill(skill);
		setFields({});
		setIsSkillFormOpen(true);
	}

	function closeSkillForm() {
		if (isSubmitting) return;

		setEditingSkill(null);
		setFields({});
		setIsSkillFormOpen(false);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const input = skillFormDataToInput(new FormData(event.currentTarget));
		setFields({});
		setIsSubmitting(true);
		try {
			const result = editingSkill ? await updateSkill(editingSkill.id, input) : await createSkill(input);
			if ("error" in result) {
				setFields(result.error.fields ?? { _form: result.error.message });
				return;
			}

			setEditingSkill(null);
			setIsSkillFormOpen(false);
			setMessage({ text: "Keahlian tersimpan.", type: "success" });
			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete() {
		if (!skillToDelete) return;

		const result = await deleteSkill(skillToDelete.id);
		if ("error" in result) {
			setMessage({ text: result.error.message, type: "error" });
			return;
		}

		setSkillToDelete(null);
		setMessage({ text: "Keahlian terhapus.", type: "success" });
		router.refresh();
	}

	return (
		<section className="w-full">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Skills</h1>
					<p className="mt-1 text-sm text-text-mute">{initialSkills.length} skill tersedia</p>
				</div>
				<Button
					className="inline-flex items-center gap-2"
					icon={<FaPlus aria-hidden="true" />}
					onClick={openCreateSkill}
					type="button"
				>
					Tambah Skill
				</Button>
			</div>
			{message ? <StatusMessage message={message.text} type={message.type} /> : null}
			<div className="mt-8 rounded-xl border border-border bg-canvas p-4 sm:p-5">
				<label className="sr-only" htmlFor="skill-search">
					Cari skill
				</label>
				<div className="relative">
					<FaMagnifyingGlass className="-translate-y-1/2 absolute top-1/2 left-3 text-text-mute" aria-hidden="true" />
					<input
						className="w-full rounded-md border border-border bg-surface py-3 pr-3 pl-10 outline-none focus:border-accent"
						id="skill-search"
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Cari skill"
						value={searchQuery}
					/>
				</div>
				{initialSkills.length === 0 ? (
					<p className="mt-6 rounded-lg border border-border border-dashed bg-surface p-6 text-center text-sm text-text-mute">
						Belum ada skill. Tambahkan skill pertama Anda.
					</p>
				) : null}
				{initialSkills.length > 0 && visibleSkills.length === 0 ? (
					<p className="mt-6 text-center text-sm text-text-mute">Skill tidak ditemukan.</p>
				) : null}
				{visibleSkills.length > 0 ? (
					<ul className="mt-5 flex flex-wrap gap-2" aria-label="Daftar skill">
						{visibleSkills.map((skill) => (
							<li key={skill.id}>
								<button
									className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 font-medium text-sm transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
									onClick={() => openEditSkill(skill)}
									type="button"
								>
									<SkillIcon icon={skill.icon} />
									{skill.name}
								</button>
							</li>
						))}
					</ul>
				) : null}
			</div>
			{isSkillFormOpen ? (
				<SkillFormDialog
					editingSkill={editingSkill}
					error={fields}
					folders={folders}
					isSubmitting={isSubmitting}
					media={media}
					mediaCurrentPage={mediaCurrentPage}
					mediaTotalPages={mediaTotalPages}
					onCancel={closeSkillForm}
					onDelete={
						editingSkill
							? () => {
									setIsSkillFormOpen(false);
									setSkillToDelete(editingSkill);
								}
							: undefined
					}
					onSubmit={handleSubmit}
				/>
			) : null}
			<ConfirmDialog
				description={deletionDescription}
				itemName={`skill '${skillToDelete?.name ?? ""}'`}
				onCancel={() => setSkillToDelete(null)}
				onConfirm={handleDelete}
				open={Boolean(skillToDelete)}
			/>
		</section>
	);
}

function SkillIcon({ icon }: { icon: string | null }): ReactNode {
	const Icon = getSkillIcon(icon);

	if (isImageUrl(icon)) {
		return (
			// biome-ignore lint/performance/noImgElement: URL gambar dipilih dari galeri Media yang dikelola admin.
			<img src={icon} alt="" className="size-4 object-contain" />
		);
	}

	return Icon ? <Icon aria-hidden="true" /> : <span aria-hidden="true">&lt;/&gt;</span>;
}

function SkillFormDialog({
	editingSkill,
	error,
	folders,
	isSubmitting,
	media,
	mediaCurrentPage,
	mediaTotalPages,
	onCancel,
	onDelete,
	onSubmit,
}: {
	editingSkill: PublicSkill | null;
	error: Record<string, string>;
	folders: { id: string; name: string }[];
	isSubmitting: boolean;
	media: MediaImagePickerItem[];
	mediaCurrentPage: number;
	mediaTotalPages: number;
	onCancel: () => void;
	onDelete?: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
	const [iconUrl, setIconUrl] = useState(editingSkill?.icon ?? "");
	const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
	const title = editingSkill ? "Ubah Skill" : "Tambah Skill";

	return (
		<div aria-label={title} aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-5" role="dialog">
			<button aria-label="Tutup form skill" className="absolute inset-0 bg-black/50" onClick={onCancel} type="button" />
			<form
				key={editingSkill?.id ?? "new"}
				onSubmit={onSubmit}
				className="relative w-full max-w-md rounded-xl border border-border bg-canvas p-5 shadow-xl sm:p-6"
			>
				<div className="flex items-center justify-between gap-4">
					<h2 className="font-bold text-xl">{title}</h2>
					<button
						aria-label="Tutup form skill"
						className="grid size-9 place-items-center rounded-md text-text-mute hover:bg-surface hover:text-text"
						disabled={isSubmitting}
						onClick={onCancel}
						type="button"
					>
						<FaXmark aria-hidden="true" />
					</button>
				</div>
				<div className="mt-6 space-y-5">
					<FormField error={error.name} label="Nama skill" required>
						<input
							aria-label="Nama skill"
							className={inputClassName}
							defaultValue={editingSkill?.name}
							disabled={isSubmitting}
							name="name"
						/>
					</FormField>
					<FormField error={error.icon ?? error._form} label="Ikon" required>
						<input name="icon" type="hidden" value={iconUrl} />
						<button
							aria-label="Pilih ikon"
							className="flex w-full items-center gap-4 rounded-lg border border-border border-dashed bg-surface p-4 text-left transition-colors hover:border-accent"
							disabled={isSubmitting}
							onClick={() => setIsIconPickerOpen(true)}
							type="button"
						>
							{isImageUrl(iconUrl) ? (
								// biome-ignore lint/performance/noImgElement: URL gambar dipilih dari galeri Media yang dikelola admin.
								<img src={iconUrl} alt="Pratinjau ikon keahlian" className="size-14 rounded-md object-contain" />
							) : (
								<span className="grid size-14 place-items-center rounded-md bg-canvas text-text-mute">
									<FaImage aria-hidden="true" />
								</span>
							)}
							<span>
								<span className="block font-medium">{isImageUrl(iconUrl) ? "Ganti ikon" : "Pilih ikon"}</span>
								<span className="mt-1 block text-sm text-text-mute">Pilih gambar dari galeri Media.</span>
							</span>
						</button>
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
					<div className="ml-auto">
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
			{isIconPickerOpen ? (
				<MediaImagePickerModal
					currentPage={mediaCurrentPage}
					folders={folders}
					media={media}
					onClose={() => setIsIconPickerOpen(false)}
					onSelect={setIconUrl}
					selectedUrl={iconUrl}
					title="Pilih Ikon Keahlian"
					totalPages={mediaTotalPages}
				/>
			) : null}
		</div>
	);
}
