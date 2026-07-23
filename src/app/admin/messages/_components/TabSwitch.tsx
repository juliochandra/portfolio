import Link from "next/link";

type MessageTab = "aktif" | "arsip";

type TabSwitchProps = {
	activeTab: MessageTab;
};

const tabStyles = "rounded-md px-4 py-2 font-medium text-sm";

export function TabSwitch({ activeTab }: TabSwitchProps) {
	return (
		<nav className="mt-6 flex gap-2" aria-label="Tab pesan">
			<Link
				href="/admin/messages?tab=aktif"
				className={`${tabStyles} ${activeTab === "aktif" ? "bg-primary text-white" : "border border-border hover:bg-surface"}`}
			>
				Active
			</Link>
			<Link
				href="/admin/messages?tab=arsip"
				className={`${tabStyles} ${activeTab === "arsip" ? "bg-primary text-white" : "border border-border hover:bg-surface"}`}
			>
				Archived
			</Link>
		</nav>
	);
}
