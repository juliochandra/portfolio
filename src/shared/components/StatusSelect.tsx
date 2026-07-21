import type { SelectHTMLAttributes } from "react";
import { publishStatuses, publishStatusLabels } from "@/shared/publish-status";

type StatusSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children">;

export function StatusSelect({ className = "", defaultValue = "DRAFT", ...props }: StatusSelectProps) {
	return (
		<select
			{...props}
			defaultValue={defaultValue}
			className={`w-full rounded-md border border-border bg-canvas px-3 py-3 outline-none focus:border-accent ${className}`}
		>
			{publishStatuses.map((status) => (
				<option key={status} value={status}>
					{publishStatusLabels[status]}
				</option>
			))}
		</select>
	);
}
