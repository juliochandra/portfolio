"use client";

import { useContext } from "react";
import { CiDark, CiLight } from "react-icons/ci";
import { ThemeContext } from "./ThemeProvider";

export function ThemeToggle() {
	const { theme, toggleTheme } = useContext(ThemeContext);
	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="grid size-10 place-items-center rounded-full border border-border text-lg transition-colors hover:border-text-mute"
			aria-label={theme === "dark" ? "Gunakan tema terang" : "Gunakan tema gelap"}
		>
			{theme === "dark" ? <CiLight aria-hidden="true" /> : <CiDark aria-hidden="true" />}
		</button>
	);
}
