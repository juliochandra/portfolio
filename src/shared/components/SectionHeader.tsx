import type { ReactNode } from "react";

type SectionHeaderProps = {
	align?: "center" | "left";
	badge: string;
	description: ReactNode;
	name?: string;
	title: ReactNode;
};

export function SectionHeader({ align = "center", badge, description, name, title }: SectionHeaderProps) {
	const isLeftAligned = align === "left";

	return (
		<header className={isLeftAligned ? "max-w-3xl text-left" : "mx-auto max-w-3xl text-center"}>
			<p className="inline-flex rounded-lg bg-accent/10 px-3 py-1.5 font-semibold text-accent text-md">{badge}</p>
			{name ? <h1 className="mt-4 font-bold text-5xl tracking-[-0.06em] sm:text-7xl">{name}</h1> : null}
			<h2 className="mt-8 font-bold text-3xl tracking-tight sm:text-4xl">{title}</h2>
			<p className="mt-4 text-text-mute leading-7">{description}</p>
			{isLeftAligned ? <div className="mt-5 h-1 w-12 bg-accent" aria-hidden="true" /> : null}
		</header>
	);
}
