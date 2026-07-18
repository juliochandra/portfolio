import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/shared/components/ThemeProvider";

export const metadata: Metadata = {
	title: { default: "Portfolio", template: "%s | Portfolio" },
	description: "Portfolio developer profesional.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="id" suppressHydrationWarning>
			<body className="antialiased">
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
