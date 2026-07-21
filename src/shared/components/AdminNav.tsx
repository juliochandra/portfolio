"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { IconType } from "react-icons";
import {
	FaBars,
	FaBriefcase,
	FaCode,
	FaFileLines,
	FaFolderOpen,
	FaImage,
	FaInbox,
	FaLink,
	FaLock,
	FaRightFromBracket,
	FaTag,
	FaXmark,
} from "react-icons/fa6";
import { logout } from "@/features/auth/auth.action";
import { Button } from "@/shared/components/Button";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

type NavigationItem = {
	href: string;
	icon: IconType;
	label: string;
};

type NavigationGroup = {
	items: NavigationItem[];
	label: string;
};

const navigationGroups: NavigationGroup[] = [
	{ items: [{ href: "/admin", icon: FaFolderOpen, label: "Dashboard" }], label: "Overview" },
	{
		items: [
			{ href: "/admin/posts", icon: FaFileLines, label: "Posts" },
			{ href: "/admin/projects", icon: FaBriefcase, label: "Projects" },
			{ href: "/admin/tags", icon: FaTag, label: "Tags" },
			{ href: "/admin/skills", icon: FaCode, label: "Skills" },
			{ href: "/admin/media", icon: FaImage, label: "Media" },
		],
		label: "Content",
	},
	{
		items: [
			{ href: "/admin/messages", icon: FaInbox, label: "Messages" },
			{ href: "/admin/contact", icon: FaLink, label: "Contact Info" },
		],
		// biome-ignore lint/nursery/noSecrets: navigation group label
		label: "Communication",
	},
	{ items: [{ href: "/admin/password", icon: FaLock, label: "Password" }], label: "System" },
];

export function AdminNav() {
	const pathname = usePathname();
	const router = useRouter();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	async function handleLogout() {
		await logout();
		router.push("/login");
		router.refresh();
	}

	function closeMenu() {
		setIsMenuOpen(false);
	}

	return (
		<aside className="border-border border-b bg-canvas lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0">
			<div className="flex items-center justify-between px-5 py-5 lg:block lg:px-7 lg:pt-8">
				<Link href="/admin" className="inline-block" onClick={closeMenu}>
					<p className="font-bold text-3xl tracking-[-0.08em]">
						JULIO<span className="text-accent">.</span>
					</p>
					<p className="mt-1 text-sm text-text-mute">CMS Dashboard</p>
				</Link>
				<div className="flex items-center gap-2 lg:hidden">
					<ThemeToggle />
					<Button type="button" variant="secondary" className="px-3" onClick={handleLogout}>
						Keluar
					</Button>
					<button
						type="button"
						aria-controls="admin-navigation"
						aria-expanded={isMenuOpen}
						aria-label={isMenuOpen ? "Tutup menu admin" : "Buka menu admin"}
						onClick={() => setIsMenuOpen((menuOpen) => !menuOpen)}
						className="grid size-10 place-items-center rounded-full border border-border text-lg"
					>
						{isMenuOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
					</button>
				</div>
			</div>

			<nav id="admin-navigation" className={`${isMenuOpen ? "block" : "hidden"} px-5 pb-5 lg:block lg:px-5 lg:pb-0`}>
				{navigationGroups.map((group) => (
					<div key={group.label} className="mt-6 first:mt-0 lg:mt-8 lg:first:mt-0">
						<p className="px-2 font-semibold text-text-mute text-xs uppercase tracking-wide">{group.label}</p>
						<ul className="mt-2 space-y-1">
							{group.items.map((item) => {
								const Icon = item.icon;
								const isActive = pathname === item.href;

								return (
									<li key={item.href}>
										<Link
											href={item.href}
											onClick={closeMenu}
											className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-colors ${
												isActive ? "bg-accent/10 text-accent" : "text-text-mute hover:bg-surface hover:text-text"
											}`}
										>
											<Icon className="text-lg" aria-hidden="true" />
											{item.label}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</nav>

			<div className="mt-auto hidden border-border border-t p-5 lg:block">
				<div className="flex items-center justify-between">
					<span className="text-sm text-text-mute">Tema</span>
					<ThemeToggle />
				</div>
				<Button
					type="button"
					variant="secondary"
					className="mt-4 w-full"
					icon={<FaRightFromBracket />}
					onClick={handleLogout}
				>
					Keluar
				</Button>
			</div>
		</aside>
	);
}
