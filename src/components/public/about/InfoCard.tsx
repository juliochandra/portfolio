import type { IconType } from "react-icons";

type InfoCardProps = {
	description: string;
	icon: IconType;
	title: string;
	variant?: "bordered" | "plain";
};

export function InfoCard({ description, icon: Icon, title }: InfoCardProps) {
	return (
		<article className="rounded-xl border border-border bg-canvas p-6">
			<Icon className="text-3xl text-accent" aria-hidden="true" />
			<h3 className="mt-4 font-bold text-xl">{title}</h3>
			<p className="mt-2 text-text-mute leading-7">{description}</p>
		</article>
	);
}
