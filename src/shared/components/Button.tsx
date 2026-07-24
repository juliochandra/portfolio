import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	icon?: ReactNode;
	isLoading?: boolean;
	variant?: "danger" | "primary" | "secondary";
};

export function Button({ className = "", icon, isLoading, variant = "primary", children, disabled, ...props }: Props) {
	const styles = { primary: "bg-primary text-white", secondary: "border border-border", danger: "bg-danger text-white" };
	return (
		<button
			{...props}
			disabled={disabled || isLoading}
			className={`rounded-md px-4 py-2 font-medium disabled:opacity-60 ${styles[variant]} ${className}`}
		>
			{!isLoading ? icon : null}
			{/* biome-ignore lint/nursery/noSecrets: UI loading label */}
			{isLoading ? "Memproses…" : children}
		</button>
	);
}
