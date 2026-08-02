"use client";

import { type FormEvent, useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { changePassword } from "@/features/auth/auth.action";
import { changePasswordSchema } from "@/features/auth/auth.schema";
import { validateWithZod } from "@/lib/validation/zod";
import { FormField } from "@/shared/components/FormField";
import { StatusMessage } from "@/shared/components/StatusMessage";

function getPasswordInputClassName(hasError: boolean): string {
	return `w-full rounded-md border bg-canvas px-12 py-3 outline-none focus:border-accent ${hasError ? "border-danger" : "border-border"}`;
}

export function PasswordForm() {
	const [confirmPassword, setConfirmPassword] = useState("");
	const [fields, setFields] = useState<Record<string, string>>({});
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
	const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
	const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [newPassword, setNewPassword] = useState("");
	const [oldPassword, setOldPassword] = useState("");

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const validation = validateWithZod(changePasswordSchema, { confirmPassword, newPassword, oldPassword });

		setFields({});
		setMessage(null);
		if (!validation.success) {
			setFields(validation.fields);
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await changePassword(validation.data);
			if ("error" in result) {
				if ("fields" in result.error) {
					setFields(result.error.fields);
					return;
				}

				setMessage(result.error.message);
				return;
			}

			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setMessage("Kata sandi berhasil diganti.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="mt-8 max-w-xl">
			{message ? (
				<StatusMessage message={message} type={message === "Kata sandi berhasil diganti." ? "success" : "error"} />
			) : null}
			<div className="mt-6 grid gap-5">
				<FormField
					label="Kata sandi lama"
					required
					error={fields.oldPassword}
					startAdornment={<FaLock aria-hidden="true" />}
					endAdornment={
						<button
							type="button"
							onClick={() => setIsOldPasswordVisible((visible) => !visible)}
							className="text-text-mute hover:text-text"
							aria-label={isOldPasswordVisible ? "Sembunyikan kata sandi lama" : "Lihat kata sandi lama"}
						>
							{isOldPasswordVisible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
						</button>
					}
				>
					<input
						name="oldPassword"
						value={oldPassword}
						onChange={(event) => setOldPassword(event.target.value)}
						type={isOldPasswordVisible ? "text" : "password"}
						autoComplete="current-password"
						aria-label="Kata sandi lama"
						disabled={isSubmitting}
						className={getPasswordInputClassName(Boolean(fields.oldPassword))}
					/>
				</FormField>
				<FormField
					label="Kata sandi baru"
					required
					error={fields.newPassword}
					startAdornment={<FaLock aria-hidden="true" />}
					endAdornment={
						<button
							type="button"
							onClick={() => setIsNewPasswordVisible((visible) => !visible)}
							className="text-text-mute hover:text-text"
							aria-label={isNewPasswordVisible ? "Sembunyikan kata sandi baru" : "Lihat kata sandi baru"}
						>
							{isNewPasswordVisible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
						</button>
					}
				>
					<input
						name="newPassword"
						value={newPassword}
						onChange={(event) => setNewPassword(event.target.value)}
						type={isNewPasswordVisible ? "text" : "password"}
						autoComplete="new-password"
						aria-label="Kata sandi baru"
						disabled={isSubmitting}
						className={getPasswordInputClassName(Boolean(fields.newPassword))}
					/>
				</FormField>
				<FormField
					label="Konfirmasi kata sandi baru"
					required
					error={fields.confirmPassword}
					startAdornment={<FaLock aria-hidden="true" />}
					endAdornment={
						<button
							type="button"
							onClick={() => setIsConfirmPasswordVisible((visible) => !visible)}
							className="text-text-mute hover:text-text"
							aria-label={isConfirmPasswordVisible ? "Sembunyikan konfirmasi kata sandi" : "Lihat konfirmasi kata sandi"}
						>
							{isConfirmPasswordVisible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
						</button>
					}
				>
					<input
						name="confirmPassword"
						value={confirmPassword}
						onChange={(event) => setConfirmPassword(event.target.value)}
						type={isConfirmPasswordVisible ? "text" : "password"}
						autoComplete="new-password"
						aria-label="Konfirmasi kata sandi baru"
						disabled={isSubmitting}
						className={getPasswordInputClassName(Boolean(fields.confirmPassword))}
					/>
				</FormField>
			</div>
			<Button type="submit" isLoading={isSubmitting} className="mt-8">
				Simpan
			</Button>
		</form>
	);
}
