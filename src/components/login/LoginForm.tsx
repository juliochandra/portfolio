"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { login } from "@/features/auth/auth.action";
import { loginSchema } from "@/features/auth/auth.schema";
import { validateWithZod } from "@/lib/validation/zod";

const INVALID_CREDENTIALS_MESSAGE = "Data masuk keliru. Periksa kembali.";
const TEMPORARY_ADMIN_USERNAME = "admin";
const TEMPORARY_ADMIN_PASSWORD = "change-me-after-first-login";
const inputClassName = "w-full rounded-md border border-border bg-canvas py-3 outline-none focus:border-accent";

export function LoginForm() {
	const router = useRouter();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const validation = validateWithZod(loginSchema, {
			password: formData.get("password"),
			username: formData.get("username"),
		});

		setErrorMessage(null);
		if (!validation.success) {
			setErrorMessage(INVALID_CREDENTIALS_MESSAGE);
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await login(validation.data);
			if ("error" in result) {
				setErrorMessage(INVALID_CREDENTIALS_MESSAGE);
				return;
			}

			router.replace("/admin");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="rounded-xl border border-border bg-canvas p-6 shadow-sm sm:p-10">
			<div className="mx-auto grid size-24 place-items-center rounded-full bg-accent/10 text-4xl text-accent">
				<FaUser aria-hidden="true" />
			</div>
			<h1 className="mt-8 text-center font-bold text-4xl tracking-tight">Login</h1>
			<p className="mt-3 text-center text-text-mute">Masuk untuk mengelola website.</p>
			{errorMessage ? <StatusMessage message={errorMessage} type="error" /> : null}
			<div className="mt-8 grid gap-5">
				<FormField label="Username" required startAdornment={<FaUser aria-hidden="true" />}>
					<input
						name="username"
						defaultValue={TEMPORARY_ADMIN_USERNAME}
						autoComplete="username"
						aria-label="Username"
						placeholder="Masukkan username"
						disabled={isSubmitting}
						className={`${inputClassName} pl-12`}
					/>
				</FormField>
				<FormField
					label="Password"
					required
					startAdornment={<FaLock aria-hidden="true" />}
					endAdornment={
						<button
							type="button"
							onClick={() => setIsPasswordVisible((visible) => !visible)}
							className="text-text-mute hover:text-text"
							aria-label={isPasswordVisible ? "Sembunyikan password" : "Lihat password"}
						>
							{isPasswordVisible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
						</button>
					}
				>
					<input
						name="password"
						defaultValue={TEMPORARY_ADMIN_PASSWORD}
						type={isPasswordVisible ? "text" : "password"}
						autoComplete="current-password"
						aria-label="Password"
						placeholder="Masukkan password"
						disabled={isSubmitting}
						className={`${inputClassName} px-12`}
					/>
				</FormField>
			</div>
			<Button type="submit" isLoading={isSubmitting} className="mt-8 w-full">
				Login
			</Button>
		</form>
	);
}
