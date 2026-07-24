"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { CiAt, CiLink } from "react-icons/ci";
import { FaLinkedin } from "react-icons/fa";
import { FaImage } from "react-icons/fa6";
import { SiGithub, SiX } from "react-icons/si";
import { createContactInfo, deleteContactInfo, updateContactInfo } from "@/features/contact/contact.action";
import { createContactInfoSchema, updateContactInfoSchema } from "@/features/contact/contact.schema";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/FormField";
import { ManageRow } from "@/shared/components/ManageRow";
import { type MediaImagePickerItem, MediaImagePickerModal } from "@/shared/components/MediaImagePickerModal";
import { StatusMessage } from "@/shared/components/StatusMessage";
import { isImageUrl } from "@/shared/validation/is-image-url";
import { validateWithZod } from "@/shared/validation/zod";

type Contact = {
	icon: string | null;
	id: string;
	label: string;
	value: string;
};

type ContactInfoManagerProps = {
	folders?: { id: string; name: string }[];
	initialContacts: Contact[];
	media?: MediaImagePickerItem[];
	mediaCurrentPage?: number;
	mediaTotalPages?: number;
};

const iconOptions = [
	{ Icon: CiAt, label: "Email", value: "simail" },
	{ Icon: FaLinkedin, label: "LinkedIn", value: "linkedin" },
	{ Icon: SiGithub, label: "GitHub", value: "github" },
	{ Icon: SiX, label: "X", value: "x" },
	{ Icon: CiLink, label: "Tautan", value: "link" },
] as const;

const iconMap = Object.fromEntries(iconOptions.map((option) => [option.value, option.Icon]));
const inputClassName = "w-full rounded-md border border-border bg-canvas px-3 py-3 outline-none focus:border-accent";

function createContactInput(formData: FormData): Record<string, unknown> {
	return {
		icon: formData.get("icon") ?? "",
		label: formData.get("label") ?? "",
		value: formData.get("value") ?? "",
	};
}

function getContactIcon(icon: string | null) {
	return icon ? (iconMap[icon.toLowerCase()] ?? CiLink) : undefined;
}

function getContactIconContent(icon: string | null): ReactNode {
	if (isImageUrl(icon)) {
		return (
			// biome-ignore lint/performance/noImgElement: URL gambar dipilih dari galeri Media yang dikelola admin.
			<img src={icon} alt="" className="size-5 object-contain" />
		);
	}

	const Icon = getContactIcon(icon);
	return Icon ? <Icon aria-hidden="true" /> : undefined;
}

export function ContactInfoManager({
	folders = [],
	initialContacts,
	media = [],
	mediaCurrentPage = 1,
	mediaTotalPages = 1,
}: ContactInfoManagerProps) {
	const router = useRouter();
	const [editingContact, setEditingContact] = useState<Contact | null>(null);
	const [fields, setFields] = useState<Record<string, string>>({});
	const [iconUrl, setIconUrl] = useState("");
	const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const input = createContactInput(new FormData(form));
		const validation = validateWithZod(editingContact ? updateContactInfoSchema : createContactInfoSchema, input);

		if (!validation.success) {
			setFields(validation.fields);
			return;
		}

		setFields({});
		setIsSubmitting(true);
		try {
			const result = editingContact ? await updateContactInfo(editingContact.id, input) : await createContactInfo(input);
			if ("error" in result) {
				setFields("fields" in result.error ? result.error.fields : { _form: result.error.message });
				return;
			}

			form.reset();
			setEditingContact(null);
			setIconUrl("");
			setMessage({ text: "Info kontak tersimpan.", type: "success" });
			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete(contact: Contact) {
		const result = await deleteContactInfo(contact.id);
		if ("error" in result) {
			setMessage({ text: result.error.message, type: "error" });
			return;
		}

		if (editingContact?.id === contact.id) {
			setEditingContact(null);
			setFields({});
			setIconUrl("");
		}
		setMessage({ text: "Info kontak terhapus.", type: "success" });
		router.refresh();
	}

	function startEditing(contact: Contact) {
		setFields({});
		setMessage(null);
		setEditingContact(contact);
		setIconUrl(contact.icon ?? "");
	}

	return (
		<section>
			<h1 className="font-bold text-3xl tracking-tight">Contact Info</h1>
			{message ? <StatusMessage message={message.text} type={message.type} /> : null}
			<form
				key={editingContact?.id ?? "new"}
				onSubmit={handleSubmit}
				className="mt-8 space-y-6 rounded-xl border border-border bg-canvas p-5 sm:p-8"
			>
				<FormField label="Label" required error={fields.label}>
					<input
						name="label"
						aria-label="Label"
						defaultValue={editingContact?.label}
						disabled={isSubmitting}
						className={inputClassName}
					/>
				</FormField>
				<FormField label="URL" required error={fields.value}>
					<input
						name="value"
						aria-label="URL"
						defaultValue={editingContact?.value}
						disabled={isSubmitting}
						placeholder="https://example.com atau mailto:email@example.com"
						type="url"
						className={inputClassName}
					/>
				</FormField>
				<FormField label="Ikon" error={fields.icon}>
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
							<img src={iconUrl} alt="Pratinjau ikon kontak" className="size-14 rounded-md object-contain" />
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
				{fields._form ? <StatusMessage message={fields._form} type="error" /> : null}
				<Button type="submit" isLoading={isSubmitting}>
					{editingContact ? "Simpan" : "+ Tambah"}
				</Button>
			</form>
			<section className="mt-10" aria-labelledby="contacts-list-title">
				<h2 id="contacts-list-title" className="font-semibold text-xl">
					Daftar Saluran
				</h2>
				{initialContacts.length === 0 ? (
					<p className="mt-4 rounded-xl border border-border bg-surface p-6 text-center text-text-mute">
						Belum ada saluran kontak. Tambahkan yang pertama.
					</p>
				) : (
					<div className="mt-4 rounded-xl border border-border bg-canvas px-5 sm:px-6">
						{initialContacts.map((contact) => {
							const icon = getContactIconContent(contact.icon);

							return (
								<ManageRow
									key={contact.id}
									description={contact.value}
									icon={icon}
									itemType="saluran"
									onDelete={() => handleDelete(contact)}
									onEdit={() => startEditing(contact)}
									title={contact.label}
								/>
							);
						})}
					</div>
				)}
			</section>
			{isIconPickerOpen ? (
				<MediaImagePickerModal
					currentPage={mediaCurrentPage}
					folders={folders}
					media={media}
					onClear={() => setIconUrl("")}
					onClose={() => setIsIconPickerOpen(false)}
					onSelect={setIconUrl}
					selectedUrl={iconUrl}
					title="Pilih Ikon Kontak"
					totalPages={mediaTotalPages}
				/>
			) : null}
		</section>
	);
}
