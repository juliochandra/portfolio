"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import type { PublishStatus } from "@/shared/publish-status";

type ManageRowProps = {
	description: string | null;
	editHref: string;
	onDelete: () => Promise<void>;
	status: PublishStatus;
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

export function ManageRow({ description, editHref, onDelete, status, title }: ManageRowProps) {
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	async function handleDelete() {
		await onDelete();
		setIsConfirmOpen(false);
	}

	return (
		<article className="flex flex-col gap-4 border-border border-b py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0">
				<h2 className="font-semibold">{title}</h2>
				<p className="mt-1 line-clamp-2 text-sm text-text-mute">{description ?? "Tidak ada gambaran singkat."}</p>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<span className={`rounded-full px-2.5 py-1 font-medium text-xs ${statusStyles[status]}`}>
					{getStatusLabel(status)}
				</span>
				<Link href={editHref} className="rounded-md px-3 py-2 font-medium text-accent text-sm hover:bg-accent/10">
					Ubah
				</Link>
				<Button type="button" variant="danger" className="px-3 text-sm" onClick={() => setIsConfirmOpen(true)}>
					Hapus
				</Button>
			</div>
			<ConfirmDialog
				itemName={`project '${title}'`}
				open={isConfirmOpen}
				onCancel={() => setIsConfirmOpen(false)}
				onConfirm={handleDelete}
			/>
		</article>
	);
}
