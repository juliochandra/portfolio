"use client";

import { useContext } from "react";
import { CiDark, CiLight } from "react-icons/ci";
import { ThemeContext } from "./ThemeProvider";

type ThemeToggleProps = {
	variant?: "icon" | "menu";
};

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
	const { theme, toggleTheme } = useContext(ThemeContext);
	const Icon = theme === "dark" ? CiLight : CiDark;
	const label = theme === "dark" ? "Gunakan tema terang" : "Gunakan tema gelap";

	if (variant === "menu") {
		return (
			<button
				type="button"
				onClick={toggleTheme}
				className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm text-text-mute transition-colors hover:bg-surface hover:text-text"
				title={label}
			>
				<Icon className="text-lg" aria-hidden="true" />
				Tema
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="grid size-10 place-items-center rounded-full border border-border text-lg transition-colors hover:border-text-mute"
			aria-label={label}
		>
			<Icon aria-hidden="true" />
		</button>
	);
}
