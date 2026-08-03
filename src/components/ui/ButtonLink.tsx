import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { type ButtonSize, type ButtonVariant, buttonClassName } from "@/components/ui/Button";

type Props = Omit<ComponentProps<typeof Link>, "className"> & {
	className?: string;
	icon?: ReactNode;
	size?: ButtonSize;
	variant?: ButtonVariant;
};

export function ButtonLink({ children, className, icon, size, variant, ...props }: Props) {
	return (
		<Link {...props} className={buttonClassName({ className, size, variant })}>
			{icon}
			<span className="inline-flex items-center justify-center text-center">{children}</span>
		</Link>
	);
}
