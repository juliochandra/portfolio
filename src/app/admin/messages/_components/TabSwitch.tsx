import Link from "next/link";
import type { MessageTab } from "@/features/messages/messages.type";

type TabSwitchProps = {
	activeTab: MessageTab;
};

const tabStyles = "rounded-md px-4 py-2 font-medium text-sm transition-colors";

export function TabSwitch({ activeTab }: TabSwitchProps) {
	return (
		<nav className="mt-6 inline-flex rounded-lg border border-border bg-surface p-1" aria-label="Tab pesan">
			<Link
				href="/admin/messages?tab=aktif"
				aria-current={activeTab === "aktif" ? "page" : undefined}
				className={`${tabStyles} ${activeTab === "aktif" ? "bg-accent text-white shadow-sm" : "text-text-mute hover:bg-canvas hover:text-text"}`}
			>
				Active
			</Link>
			<Link
				href="/admin/messages?tab=arsip"
				aria-current={activeTab === "arsip" ? "page" : undefined}
				className={`${tabStyles} ${activeTab === "arsip" ? "bg-accent text-white shadow-sm" : "text-text-mute hover:bg-canvas hover:text-text"}`}
			>
				Archived
			</Link>
		</nav>
	);
}
