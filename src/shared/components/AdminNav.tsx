"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/features/auth/auth.action";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";

const links = [
	["Overview", [["Dashboard", "/admin"]]],
	[
		"Content",
		[
			["Posts", "/admin/posts"],
			["Projects", "/admin/projects"],
			["Tags", "/admin/tags"],
			["Skills", "/admin/skills"],
			["Media", "/admin/media"],
		],
	],
	[
		// biome-ignore lint/nursery/noSecrets: navigation label
		"Communication",
		[
			["Messages", "/admin/messages"],
			["Contact Info", "/admin/contact"],
		],
	],
	["System", [["Password", "/admin/password"]]],
] as const;
export function AdminNav() {
	const pathname = usePathname();
	const router = useRouter();
	const handleLogout = async () => {
		await logout();
		router.push("/login");
		router.refresh();
	};
	return (
		<header className="border-border border-b">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
				<Link href="/admin" className="font-bold">
					Portfolio <span className="text-text-mute">CMS Dashboard</span>
				</Link>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<Button variant="secondary" onClick={handleLogout}>
						Keluar
					</Button>
				</div>
			</div>
			<nav className="mx-auto hidden max-w-7xl gap-6 px-4 pb-3 sm:flex sm:px-6">
				{links.map(([group, items]) => (
					<div key={group}>
						<span className="mr-2 text-text-mute text-xs">{group}</span>
						{items.map(([label, href]) => (
							<Link
								key={href}
								href={href}
								className={`mr-2 text-sm ${pathname === href ? "font-semibold text-accent" : "text-text-mute"}`}
							>
								{label}
							</Link>
						))}
					</div>
				))}
			</nav>
		</header>
	);
}
