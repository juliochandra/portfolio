import type { InputHTMLAttributes, ReactNode } from "react";

type FormFieldProps = {
	children: ReactNode;
	endAdornment?: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
	startAdornment?: ReactNode;
};

export function FormField({ label, error, required, children, startAdornment, endAdornment }: FormFieldProps) {
	const hasAdornment = startAdornment || endAdornment;

	return (
		<div className="block space-y-2 text-sm">
			<span>
				{label}
				{required ? " *" : ""}
			</span>
			{hasAdornment ? (
				<div className="relative">
					{startAdornment ? (
						<span className="-translate-y-1/2 absolute top-1/2 left-3 text-text-mute">{startAdornment}</span>
					) : null}
					{children}
					{endAdornment ? <span className="-translate-y-1/2 absolute top-1/2 right-3">{endAdornment}</span> : null}
				</div>
			) : (
				children
			)}
			{error ? <span className="block text-danger">{error}</span> : null}
		</div>
	);
}
export type FormInputProps = InputHTMLAttributes<HTMLInputElement>;
