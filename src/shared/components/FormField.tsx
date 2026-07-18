import type { InputHTMLAttributes, ReactNode } from "react";
export function FormField({
	label,
	error,
	required,
	children,
}: {
	label: string;
	error?: string;
	required?: boolean;
	children: ReactNode;
}) {
	return (
		<div className="block space-y-2 text-sm">
			<span>
				{label}
				{required ? " *" : ""}
			</span>
			{children}
			{error ? <span className="block text-danger">{error}</span> : null}
		</div>
	);
}
export type FormInputProps = InputHTMLAttributes<HTMLInputElement>;
