import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonSize = "lg" | "md" | "sm";
export type ButtonVariant = "danger" | "ghost" | "outline" | "primary" | "secondary";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	className?: string;
	icon?: ReactNode;
	isLoading?: boolean;
	size?: ButtonSize;
	variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
	danger: "bg-danger text-white hover:opacity-90",
	ghost: "hover:bg-surface",
	outline: "border border-border text-accent hover:bg-surface",
	primary: "bg-primary text-white hover:opacity-90",
	secondary: "border border-border hover:bg-surface",
};

const sizeClasses: Record<ButtonSize, string> = {
	lg: "px-5 py-3 font-semibold",
	md: "px-4 py-2",
	sm: "px-3 py-1.5 text-sm",
};

export function buttonClassName({
	className,
	size = "md",
	variant = "primary",
}: {
	className?: string;
	size?: ButtonSize;
	variant?: ButtonVariant;
} = {}): string {
	return [
		"inline-flex items-center justify-center gap-2 rounded-md text-center font-medium leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-60",
		variantClasses[variant],
		sizeClasses[size],
		className,
	]
		.filter(Boolean)
		.join(" ");
}

export function Button({ className, icon, isLoading = false, size, variant, children, disabled, ...props }: Props) {
	return (
		<button
			{...props}
			aria-busy={isLoading || undefined}
			className={buttonClassName({ className, size, variant })}
			disabled={disabled || isLoading}
		>
			{!isLoading ? icon : null}
			{/* biome-ignore lint/nursery/noSecrets: UI loading label */}
			<span className="inline-flex items-center justify-center text-center">{isLoading ? "Memproses…" : children}</span>
		</button>
	);
}
