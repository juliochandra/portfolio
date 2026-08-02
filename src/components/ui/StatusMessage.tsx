"use client";

import { useEffect, useId } from "react";
import { toast } from "react-toastify";

type StatusMessageProps = {
	message: string;
	type?: "error" | "info" | "success";
};

export function StatusMessage({ message, type = "info" }: StatusMessageProps) {
	const toastId = useId();

	useEffect(() => {
		if (type === "error") {
			toast.error(message, { toastId });
			return;
		}

		if (type === "success") {
			toast.success(message, { toastId });
			return;
		}

		toast.info(message, { toastId });
	}, [message, toastId, type]);

	return (
		<span aria-hidden="true" className="sr-only">
			{message}
		</span>
	);
}
