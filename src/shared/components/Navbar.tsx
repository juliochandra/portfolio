"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
	["HOME", "/"],
	["ABOUT", "/about"],
	["PORTFOLIO", "/portfolio"],
	["BLOG", "/blog"],
	["CONTACT", "/contact"],
] as const;

export function Navbar() {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const [isMenuVisible, setIsMenuVisible] = useState(false);
	const closeMenu = () => {
		setIsOpen(false);
	};
	const toggleMenu = () => {
		if (isOpen) {
			closeMenu();
			return;
		}

		setIsMenuVisible(true);
		setIsOpen(true);
	};
	return (
		<header className="navbar sticky top-0 z-50 border-border border-b shadow-lg">
			<nav className="mx-auto flex min-h-14 items-center px-6 lg:px-16">
				<Link href="/" className="font-bold text-2xl tracking-[-0.08em] sm:text-3xl" onClick={closeMenu}>
					JULIO.
				</Link>
				<div className="ml-auto hidden flex-1 items-center justify-center gap-10 lg:flex">
					{links.map(([label, href]) => (
						<Link
							key={href}
							href={href}
							className={pathname === href ? "font-bold text-accent" : "font-bold text-text hover:text-text-mute"}
						>
							{label}
						</Link>
					))}
				</div>
				<div className="ml-auto flex items-center gap-2">
					<div className="hidden lg:block">
						<ThemeToggle />
					</div>
					<button
						type="button"
						className="grid size-10 place-items-center rounded-full border border-border lg:hidden"
						onClick={toggleMenu}
						aria-expanded={isOpen}
						aria-label={isOpen ? "Tutup menu" : "Buka menu"}
					>
						<span aria-hidden="true" className="text-lg leading-none">
							{isOpen ? "×" : "≡"}
						</span>
					</button>
				</div>
			</nav>
			{isMenuVisible ? (
				<div
					className={`mobile-menu--${isOpen ? "open" : "closed"} absolute inset-x-0 top-full border-border border-t bg-canvas px-6 py-4 shadow-lg lg:hidden`}
					onAnimationEnd={() => {
						if (!isOpen) setIsMenuVisible(false);
					}}
				>
					{links.map(([label, href]) => (
						<Link
							key={href}
							href={href}
							className={`block py-3 ${pathname === href ? "font-bold text-accent" : "font-bold text-text hover:text-text-mute"}`}
							onClick={closeMenu}
						>
							{label}
						</Link>
					))}
					<div className="mt-3 border-border border-t pt-4">
						<ThemeToggle />
					</div>
				</div>
			) : null}
		</header>
	);
}
