import type { IconType } from "react-icons";

type CalloutProps = {
	description: string;
	icon: IconType;
	title: string;
	variant?: "icon" | "quote";
};

export function Callout({ description, icon: Icon, title, variant = "icon" }: CalloutProps) {
	const iconClassName = variant === "quote" ? "text-4xl text-accent" : "text-3xl text-accent";

	return (
		<aside className="mt-10 rounded-xl border border-border bg-canvas p-6 sm:flex sm:gap-5">
			<Icon className={iconClassName} aria-hidden="true" />
			<div className="mt-4 sm:mt-0">
				<h3 className="font-bold text-xl">{title}</h3>
				<p className="mt-2 text-text-mute leading-7">{description}</p>
			</div>
		</aside>
	);
}
