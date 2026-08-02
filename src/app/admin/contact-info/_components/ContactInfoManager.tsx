"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { CiLink } from "react-icons/ci";
import { FaCheck, FaImage, FaMagnifyingGlass, FaPlus, FaTrash, FaXmark } from "react-icons/fa6";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { createContactInfo, deleteContactInfo, updateContactInfo } from "@/features/contact/contact.action";
import { createContactInfoSchema, updateContactInfoSchema } from "@/features/contact/contact.schema";
import { isImageUrl } from "@/lib/validation/is-image-url";
import { validateWithZod } from "@/lib/validation/zod";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { type MediaImagePickerItem, MediaImagePickerModal } from "@/shared/components/MediaImagePickerModal";
import { StatusMessage } from "@/shared/components/StatusMessage";

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

const inputClassName = "w-full rounded-md border border-border bg-canvas px-3 py-3 outline-none focus:border-accent";
const deletionDescription = "Saluran ini akan dihapus dari daftar Contact Info dan footer.";

function createContactInput(formData: FormData): Record<string, unknown> {
	return {
		icon: formData.get("icon") ?? "",
		label: formData.get("label") ?? "",
		value: formData.get("value") ?? "",
	};
}

export function ContactInfoManager({
	folders = [],
	initialContacts,
	media = [],
	mediaCurrentPage = 1,
	mediaTotalPages = 1,
}: ContactInfoManagerProps) {
	const router = useRouter();
	const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
	const [editingContact, setEditingContact] = useState<Contact | null>(null);
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isContactFormOpen, setIsContactFormOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const sortedContacts = [...initialContacts].sort((firstContact, secondContact) =>
		firstContact.label.localeCompare(secondContact.label, "id", { sensitivity: "base" }),
	);
	const visibleContacts = sortedContacts.filter((contact) => {
		const query = searchQuery.trim().toLowerCase();
		return contact.label.toLowerCase().includes(query) || contact.value.toLowerCase().includes(query);
	});

	function openCreateContact() {
		setEditingContact(null);
		setFields({});
		setIsContactFormOpen(true);
	}

	function openEditContact(contact: Contact) {
		setEditingContact(contact);
		setFields({});
		setIsContactFormOpen(true);
	}

	function closeContactForm() {
		if (isSubmitting) return;

		setEditingContact(null);
		setFields({});
		setIsContactFormOpen(false);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const input = createContactInput(new FormData(event.currentTarget));
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

			setEditingContact(null);
			setIsContactFormOpen(false);
			setMessage({ text: "Info kontak tersimpan.", type: "success" });
			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete() {
		if (!contactToDelete) return;

		const result = await deleteContactInfo(contactToDelete.id);
		if ("error" in result) {
			setMessage({ text: result.error.message, type: "error" });
			return;
		}

		setContactToDelete(null);
		setMessage({ text: "Info kontak terhapus.", type: "success" });
		router.refresh();
	}

	return (
		<section className="w-full">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Contact Info</h1>
					<p className="mt-1 text-sm text-text-mute">{initialContacts.length} saluran tersedia</p>
				</div>
				<Button
					className="inline-flex items-center gap-2"
					icon={<FaPlus aria-hidden="true" />}
					onClick={openCreateContact}
					type="button"
				>
					Tambah Contact
				</Button>
			</div>
			{message ? <StatusMessage message={message.text} type={message.type} /> : null}
			<div className="mt-8 rounded-xl border border-border bg-canvas p-4 sm:p-5">
				<label className="sr-only" htmlFor="contact-search">
					Cari Contact Info
				</label>
				<div className="relative">
					<FaMagnifyingGlass className="-translate-y-1/2 absolute top-1/2 left-3 text-text-mute" aria-hidden="true" />
					<input
						className="w-full rounded-md border border-border bg-surface py-3 pr-3 pl-10 outline-none focus:border-accent"
						id="contact-search"
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Cari Contact Info"
						value={searchQuery}
					/>
				</div>
				{initialContacts.length === 0 ? (
					<p className="mt-6 rounded-lg border border-border border-dashed bg-surface p-6 text-center text-sm text-text-mute">
						Belum ada Contact Info. Tambahkan saluran pertama Anda.
					</p>
				) : null}
				{initialContacts.length > 0 && visibleContacts.length === 0 ? (
					<p className="mt-6 text-center text-sm text-text-mute">Contact Info tidak ditemukan.</p>
				) : null}
				{visibleContacts.length > 0 ? (
					<ul className="mt-5 flex flex-wrap gap-2" aria-label="Daftar Contact Info">
						{visibleContacts.map((contact) => (
							<li key={contact.id}>
								<button
									className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 font-medium text-sm transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
									onClick={() => openEditContact(contact)}
									title={contact.value}
									type="button"
								>
									<ContactIcon icon={contact.icon} />
									<span className="capitalize">{contact.label}</span>
								</button>
							</li>
						))}
					</ul>
				) : null}
			</div>
			{isContactFormOpen ? (
				<ContactFormDialog
					editingContact={editingContact}
					error={fields}
					folders={folders}
					isSubmitting={isSubmitting}
					media={media}
					mediaCurrentPage={mediaCurrentPage}
					mediaTotalPages={mediaTotalPages}
					onCancel={closeContactForm}
					onDelete={
						editingContact
							? () => {
									setIsContactFormOpen(false);
									setContactToDelete(editingContact);
								}
							: undefined
					}
					onSubmit={handleSubmit}
				/>
			) : null}
			<ConfirmDialog
				description={deletionDescription}
				itemName={`Contact Info '${contactToDelete?.label ?? ""}'`}
				onCancel={() => setContactToDelete(null)}
				onConfirm={handleDelete}
				open={Boolean(contactToDelete)}
			/>
		</section>
	);
}

function ContactIcon({ icon }: { icon: string | null }): ReactNode {
	if (isImageUrl(icon)) {
		return (
			// biome-ignore lint/performance/noImgElement: URL gambar dipilih dari galeri Media yang dikelola admin.
			<img src={icon} alt="" className="size-4 object-contain" />
		);
	}

	return <CiLink aria-hidden="true" />;
}

function ContactFormDialog({
	editingContact,
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
	editingContact: Contact | null;
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
	const [iconUrl, setIconUrl] = useState(editingContact?.icon ?? "");
	const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
	const title = editingContact ? "Ubah Contact Info" : "Tambah Contact Info";

	return (
		<div aria-label={title} aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-5" role="dialog">
			<button
				aria-label="Tutup form Contact Info"
				className="absolute inset-0 bg-black/50"
				onClick={onCancel}
				type="button"
			/>
			<form
				key={editingContact?.id ?? "new"}
				onSubmit={onSubmit}
				className="relative w-full max-w-md rounded-xl border border-border bg-canvas p-5 shadow-xl sm:p-6"
			>
				<div className="flex items-center justify-between gap-4">
					<h2 className="font-bold text-xl">{title}</h2>
					<button
						aria-label="Tutup form Contact Info"
						className="grid size-9 place-items-center rounded-md text-text-mute hover:bg-surface hover:text-text"
						disabled={isSubmitting}
						onClick={onCancel}
						type="button"
					>
						<FaXmark aria-hidden="true" />
					</button>
				</div>
				<div className="mt-6 space-y-5">
					<FormField error={error.label} label="Label" required>
						<input
							aria-label="Label"
							className={inputClassName}
							defaultValue={editingContact?.label}
							disabled={isSubmitting}
							name="label"
						/>
					</FormField>
					<FormField error={error.value} label="URL" required>
						<input
							aria-label="URL"
							className={inputClassName}
							defaultValue={editingContact?.value}
							disabled={isSubmitting}
							name="value"
							placeholder="https://example.com atau mailto:email@example.com"
							type="url"
						/>
					</FormField>
					<FormField error={error.icon ?? error._form} label="Ikon">
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
					onClear={() => setIconUrl("")}
					onClose={() => setIsIconPickerOpen(false)}
					onSelect={setIconUrl}
					selectedUrl={iconUrl}
					title="Pilih Ikon Kontak"
					totalPages={mediaTotalPages}
				/>
			) : null}
		</div>
	);
}
