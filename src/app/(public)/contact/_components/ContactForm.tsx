"use client";

import { type FormEvent, useRef, useState } from "react";
import { FaLock, FaPaperPlane } from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { sendMessage } from "@/features/messages/messages.action";
import { sendMessageSchema } from "@/features/messages/messages.schema";
import { validateWithZod } from "@/lib/validation/zod";
import { StatusMessage } from "@/shared/components/StatusMessage";

type FormErrors = Record<string, string>;

const inputClassName = "w-full rounded-md border bg-canvas px-3 py-2 outline-none focus:border-accent";

export function ContactForm() {
	const formReference = useRef<HTMLFormElement>(null);
	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	async function submitMessage(formData: FormData) {
		const input = {
			email: formData.get("email"),
			message: formData.get("message"),
			name: formData.get("name"),
		};
		const validation = validateWithZod(sendMessageSchema, input);

		setErrors({});
		setSuccessMessage(null);
		if (!validation.success) {
			setErrors(validation.fields);
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await sendMessage(validation.data);
			if ("error" in result) {
				setErrors(result.error.fields);
				return;
			}

			formReference.current?.reset();
			setSuccessMessage("Pesan terkirim. Terima kasih!");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		await submitMessage(new FormData(event.currentTarget));
	}

	return (
		<form ref={formReference} onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
			<div className="grid gap-5">
				<FormField label="Nama" required error={errors.name}>
					<input
						name="name"
						placeholder="Nama Anda"
						aria-label="Nama"
						disabled={isSubmitting}
						className={`${inputClassName} ${errors.name ? "border-danger" : "border-border"}`}
					/>
				</FormField>
				<FormField label="Email" required error={errors.email}>
					<input
						name="email"
						type="email"
						placeholder="email@contoh.com"
						aria-label="Email"
						disabled={isSubmitting}
						className={`${inputClassName} ${errors.email ? "border-danger" : "border-border"}`}
					/>
				</FormField>
				<FormField label="Pesan" required error={errors.message}>
					<textarea
						name="message"
						rows={6}
						placeholder="Ceritakan tentang project, ide, atau sapa saya..."
						aria-label="Pesan"
						disabled={isSubmitting}
						className={`${inputClassName} resize-y ${errors.message ? "border-danger" : "border-border"}`}
					/>
				</FormField>
			</div>
			<div className="mt-6">
				<Button
					type="submit"
					isLoading={isSubmitting}
					icon={<FaPaperPlane aria-hidden="true" />}
					className="inline-flex w-full items-center justify-center gap-2"
				>
					Kirim Pesan
				</Button>
				<p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-text-mute">
					<FaLock className="text-primary" aria-hidden="true" />
					Pesan Anda hanya digunakan untuk menindaklanjuti percakapan ini.
				</p>
			</div>
			{successMessage ? <StatusMessage message={successMessage} type="success" /> : null}
			{errors._form ? <StatusMessage message={errors._form} type="error" /> : null}
		</form>
	);
}
