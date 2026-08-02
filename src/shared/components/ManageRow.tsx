"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { PublishStatus } from "@/shared/publish-status";

type ManageRowAction =
	| {
			editHref: string;
			onEdit?: never;
	  }
	| {
			editHref?: never;
			onEdit: () => void;
	  };

type ManageRowProps = ManageRowAction & {
	confirmationDescription?: string;
	description?: string | null;
	icon?: ReactNode;
	itemType?: string;
	onDelete: () => Promise<void>;
	status?: PublishStatus;
	title: string;
};

const statusStyles: Record<PublishStatus, string> = {
	ARCHIVED: "bg-danger/10 text-danger",
	DRAFT: "bg-surface text-text-mute",
	PUBLISHED: "bg-primary/10 text-primary",
};

function getStatusLabel(status: PublishStatus): string {
	return `${status.slice(0, 1)}${status.slice(1).toLowerCase()}`;
}

export function ManageRow({
	confirmationDescription,
	description,
	editHref,
	icon,
	itemType = "project",
	onDelete,
	onEdit,
	status,
	title,
}: ManageRowProps) {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	async function handleDelete() {
		await onDelete();
		setIsConfirmOpen(false);
	}

	return (
		<article className="flex flex-col gap-4 border-border border-b py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 items-start gap-3">
				{icon ? <span className="mt-0.5 shrink-0 text-accent text-xl">{icon}</span> : null}
				<div className="min-w-0">
					<h2 className="font-semibold">{title}</h2>
					{description !== undefined ? (
						<p className="mt-1 line-clamp-2 text-sm text-text-mute">{description ?? "Tidak ada gambaran singkat."}</p>
					) : null}
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				{status ? (
					<span className={`rounded-full px-2.5 py-1 font-medium text-xs ${statusStyles[status]}`}>
						{getStatusLabel(status)}
					</span>
				) : null}
				{onEdit ? (
					<Button type="button" variant="secondary" className="px-3 text-sm" onClick={onEdit}>
						Ubah
					</Button>
				) : (
					<Link href={editHref} className="rounded-md px-3 py-2 font-medium text-accent text-sm hover:bg-accent/10">
						Ubah
					</Link>
				)}
				<Button type="button" variant="danger" className="px-3 text-sm" onClick={() => setIsConfirmOpen(true)}>
					Hapus
				</Button>
			</div>
			<ConfirmDialog
				description={confirmationDescription}
				itemName={`${itemType} '${title}'`}
				open={isConfirmOpen}
				onCancel={() => setIsConfirmOpen(false)}
				onConfirm={handleDelete}
			/>
		</article>
	);
}
