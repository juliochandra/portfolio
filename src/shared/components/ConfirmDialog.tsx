"use client";
import { Button } from "./Button";

type ConfirmDialogProps = {
	confirmLabel?: string;
	confirmVariant?: "danger" | "primary" | "secondary";
	description?: string;
	itemName?: string;
	onCancel: () => void;
	onConfirm: () => void;
	open: boolean;
	title?: string;
};

export function ConfirmDialog({
	confirmLabel = "Hapus",
	confirmVariant = "danger",
	description,
	itemName,
	onCancel,
	onConfirm,
	open,
	title,
}: ConfirmDialogProps) {
	if (!open) return null;

	const dialogTitle = title ?? `Hapus ${itemName ?? "item"}?`;

	return (
		<div role="dialog" aria-modal="true" className="fixed inset-0 grid place-items-center bg-black/40 p-4">
			<div className="w-full max-w-sm rounded-lg bg-surface p-6">
				<p>{dialogTitle}</p>
				{description ? <p className="mt-2 text-sm text-text-mute">{description}</p> : null}
				<div className="mt-6 flex justify-end gap-2">
					<Button variant="secondary" onClick={onCancel}>
						Batal
					</Button>
					<Button variant={confirmVariant} onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	);
}
