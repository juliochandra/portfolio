"use client";
import { Button } from "./Button";
export function ConfirmDialog({
	itemName,
	onCancel,
	onConfirm,
	open,
}: {
	itemName: string;
	onCancel: () => void;
	onConfirm: () => void;
	open: boolean;
}) {
	if (!open) return null;
	return (
		<div role="dialog" aria-modal="true" className="fixed inset-0 grid place-items-center bg-black/40 p-4">
			<div className="w-full max-w-sm rounded-lg bg-surface p-6">
				<p>Hapus {itemName}?</p>
				<div className="mt-6 flex justify-end gap-2">
					<Button variant="secondary" onClick={onCancel}>
						Batal
					</Button>
					<Button variant="danger" onClick={onConfirm}>
						Hapus
					</Button>
				</div>
			</div>
		</div>
	);
}
