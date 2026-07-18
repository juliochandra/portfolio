import type { HTMLAttributes, ReactNode } from "react";

type SectionProps = HTMLAttributes<HTMLElement> & {
	children: ReactNode;
	className?: string;
};

export function Section({ children, className = "", ...props }: SectionProps) {
	return (
		<section {...props} className={`mx-auto w-full max-w-7xl px-6 py-12 sm:py-16 lg:px-8 lg:py-24 ${className}`.trim()}>
			{children}
		</section>
	);
}
