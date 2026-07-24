import Link from "next/link";
import { FaRegFileLines } from "react-icons/fa6";
import type { PublishStatus } from "@/shared/publish-status";

type SummaryRowProps = {
	createdAt: string;
	href: string;
	labels: readonly string[];
	status: PublishStatus;
	thumbnailImage: string | null;
	title: string;
};

const statusStyles: Record<PublishStatus, string> = {
	ARCHIVED: "bg-danger/10 text-danger",
	DRAFT: "bg-surface text-text-mute",
	PUBLISHED: "bg-primary/10 text-primary",
};

function formatCreatedAt(createdAt: string): string {
	return new Intl.DateTimeFormat("en-US", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(new Date(createdAt));
}

export function SummaryRow({ createdAt, href, labels, status, thumbnailImage, title }: SummaryRowProps) {
	return (
		<Link
			href={href}
			className="group flex items-center gap-3 border-border border-b py-4 last:border-b-0 hover:bg-surface/60 sm:gap-4"
		>
			{thumbnailImage ? (
				// biome-ignore lint/performance/noImgElement: thumbnails use administrator-provided external URLs.
				<img src={thumbnailImage} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
			) : (
				<span className="grid size-16 shrink-0 place-items-center rounded-lg bg-surface text-text-mute text-xl">
					<FaRegFileLines aria-hidden="true" />
				</span>
			)}
			<div className="min-w-0 flex-1">
				<h3 className="truncate font-semibold group-hover:text-accent">{title}</h3>
				{labels.length > 0 ? (
					<ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Labels for ${title}`}>
						{labels.slice(0, 3).map((label) => (
							<li key={label} className="rounded-md bg-surface px-2 py-0.5 text-text-mute text-xs">
								{label}
							</li>
						))}
					</ul>
				) : null}
			</div>
			<div className="shrink-0 text-right">
				<span className={`rounded-full px-2.5 py-1 font-medium text-xs ${statusStyles[status]}`}>{status}</span>
				<p className="mt-2 text-sm text-text-mute">{formatCreatedAt(createdAt)}</p>
			</div>
		</Link>
	);
}
