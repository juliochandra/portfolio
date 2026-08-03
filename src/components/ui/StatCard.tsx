import type { IconType } from "react-icons";

type StatCardProps = {
	description: string;
	icon: IconType;
	label: string;
	value: string;
};

export function StatCard({ description, icon: Icon, label, value }: StatCardProps) {
	return (
		<article className="rounded-xl border border-border bg-canvas p-5">
			<Icon className="text-2xl text-accent" aria-hidden="true" />
			<p className="mt-5 font-bold text-3xl tracking-tight">{value}</p>
			<h2 className="mt-1 font-semibold">{label}</h2>
			<p className="mt-2 text-sm text-text-mute leading-6">{description}</p>
		</article>
	);
}
