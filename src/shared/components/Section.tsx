import type { HTMLAttributes, ReactNode } from "react";

type SectionProps = HTMLAttributes<HTMLElement> & {
	children: ReactNode;
};

export function Section({ children }: SectionProps) {
	return <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:py-16 lg:px-8 lg:py-32">{children}</section>;
}
