"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { createSkill, deleteSkill, updateSkill } from "@/features/skills/skills.action";
import { createSkillSchema, updateSkillSchema } from "@/features/skills/skills.schema";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/FormField";
import { ManageRow } from "@/shared/components/ManageRow";
import { getSkillIcon } from "@/shared/components/SkillTag";
import { StatusMessage } from "@/shared/components/StatusMessage";
import { validateWithZod } from "@/shared/validation/zod";

type Skill = {
	icon: string | null;
	id: string;
	name: string;
};

type SkillsManagerProps = {
	initialSkills: Skill[];
};

const iconOptions = [
	{ label: "TypeScript", value: "typescript" },
	{ label: "JavaScript", value: "javascript" },
	{ label: "React", value: "react" },
	{ label: "Next.js", value: "nextjs" },
	{ label: "Node.js", value: "nodejs" },
	{ label: "Tailwind CSS", value: "tailwindcss" },
	{ label: "Prisma", value: "prisma" },
	{ label: "PostgreSQL", value: "postgresql" },
	{ label: "Docker", value: "docker" },
	{ label: "Git", value: "git" },
	{ label: "GitHub", value: "github" },
] as const;

const inputClassName = "w-full rounded-md border border-border bg-canvas px-3 py-3 outline-none focus:border-accent";

function createSkillInput(formData: FormData): Record<string, unknown> {
	return {
		icon: formData.get("icon") ?? "",
		name: formData.get("name") ?? "",
	};
}

export function SkillsManager({ initialSkills }: SkillsManagerProps) {
	const router = useRouter();
	const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const input = createSkillInput(new FormData(form));
		const validation = validateWithZod(editingSkill ? updateSkillSchema : createSkillSchema, input);

		if (!validation.success) {
			setFields(validation.fields);
			return;
		}

		setFields({});
		setIsSubmitting(true);
		try {
			const result = editingSkill ? await updateSkill(editingSkill.id, input) : await createSkill(input);
			if ("error" in result) {
				setFields("fields" in result.error ? result.error.fields : { _form: result.error.message });
				return;
			}

			form.reset();
			setEditingSkill(null);
			setMessage({ text: "Keahlian tersimpan.", type: "success" });
			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete(skill: Skill) {
		const result = await deleteSkill(skill.id);
		if ("error" in result) {
			setMessage({ text: result.error.message, type: "error" });
			return;
		}

		if (editingSkill?.id === skill.id) {
			setEditingSkill(null);
			setFields({});
		}
		setMessage({ text: "Keahlian terhapus.", type: "success" });
		router.refresh();
	}

	function startEditing(skill: Skill) {
		setFields({});
		setMessage(null);
		setEditingSkill(skill);
	}

	return (
		<section>
			<h1 className="font-bold text-3xl tracking-tight">Skills</h1>
			{message ? <StatusMessage message={message.text} type={message.type} /> : null}
			<form
				key={editingSkill?.id ?? "new"}
				onSubmit={handleSubmit}
				className="mt-8 space-y-6 rounded-xl border border-border bg-canvas p-5 sm:p-8"
			>
				<FormField label="Nama" required error={fields.name}>
					<input
						name="name"
						aria-label="Nama"
						defaultValue={editingSkill?.name}
						disabled={isSubmitting}
						className={inputClassName}
					/>
				</FormField>
				<FormField label="Ikon" required error={fields.icon}>
					<select
						name="icon"
						aria-label="Ikon"
						defaultValue={editingSkill?.icon ?? ""}
						disabled={isSubmitting}
						className={inputClassName}
					>
						<option value="">Pilih ikon</option>
						{iconOptions.map((icon) => (
							<option key={icon.value} value={icon.value}>
								{icon.label}
							</option>
						))}
					</select>
				</FormField>
				{fields._form ? <StatusMessage message={fields._form} type="error" /> : null}
				<Button type="submit" isLoading={isSubmitting}>
					{editingSkill ? "Simpan" : "+ Tambah"}
				</Button>
			</form>
			<section className="mt-10" aria-labelledby="skills-list-title">
				<h2 id="skills-list-title" className="font-semibold text-xl">
					Daftar Keahlian
				</h2>
				{initialSkills.length === 0 ? (
					<p className="mt-4 rounded-xl border border-border bg-surface p-6 text-center text-text-mute">
						Belum ada keahlian.
					</p>
				) : (
					<div className="mt-4 rounded-xl border border-border bg-canvas px-5 sm:px-6">
						{initialSkills.map((skill) => {
							const Icon = getSkillIcon(skill.icon);

							return (
								<ManageRow
									key={skill.id}
									icon={Icon ? <Icon aria-hidden="true" /> : <span aria-hidden="true">&lt;/&gt;</span>}
									itemType="keahlian"
									onDelete={() => handleDelete(skill)}
									onEdit={() => startEditing(skill)}
									title={skill.name}
								/>
							);
						})}
					</div>
				)}
			</section>
		</section>
	);
}
