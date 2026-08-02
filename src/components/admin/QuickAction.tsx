import Link from "next/link";
import type { IconType } from "react-icons";

type QuickActionProps = {
	description: string;
	href: string;
	icon: IconType;
	label: string;
};

export function QuickAction({ description, href, icon: Icon, label }: QuickActionProps) {
	return (
		<Link
			href={href}
			aria-label={label}
			className="flex min-w-52 items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface"
		>
			<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent text-xl">
				<Icon aria-hidden="true" />
			</span>
			<span>
				<span className="block font-semibold text-sm">{label}</span>
				<span className="mt-1 block text-text-mute text-xs">{description}</span>
			</span>
		</Link>
	);
}
