"use client";
import { useEffect, useState } from "react";
export function StatusMessage({ message, type = "info" }: { message: string; type?: "error" | "info" | "success" }) {
	const [visible, setVisible] = useState(true);
	useEffect(() => {
		const timer = setTimeout(() => setVisible(false), 5000);
		return () => clearTimeout(timer);
	}, []);
	if (!visible) return null;
	let color = "text-accent";
	if (type === "error") color = "text-danger";
	if (type === "success") color = "text-primary";
	return (
		<output className={`rounded-md border border-border bg-surface p-3 text-sm ${color}`}>
			{message}
			<button type="button" className="float-right" onClick={() => setVisible(false)}>
				×
			</button>
		</output>
	);
}
