"use client";

import { createContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

export const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
	theme: "light",
	toggleTheme: () => undefined,
});

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		const stored = localStorage.getItem("theme");
		const next = stored === "dark" ? "dark" : "light";
		setTheme(next);
		document.documentElement.dataset.theme = next;
	}, []);

	const toggleTheme = () =>
		setTheme((current) => {
			const next = current === "light" ? "dark" : "light";
			localStorage.setItem("theme", next);
			document.documentElement.dataset.theme = next;
			return next;
		});

	return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}
