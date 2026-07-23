import { MessageCard } from "@/app/admin/messages/_components/MessageCard";
import { TabSwitch } from "@/app/admin/messages/_components/TabSwitch";
import { getMessages, markMessageRead } from "@/features/messages/messages.action";

type MessageTab = "aktif" | "arsip";

type MessagesPageProps = {
	searchParams: Promise<{ tab?: string }>;
};

function getMessageTab(tab: string | undefined): MessageTab {
	return tab === "arsip" ? "arsip" : "aktif";
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
	const { tab: requestedTab } = await searchParams;
	const tab = getMessageTab(requestedTab);
	const messagesResult = await getMessages({ tab });
	if ("error" in messagesResult) {
		return null;
	}

	const readResults = await Promise.all(
		messagesResult.data.filter((message) => message.status === "UNREAD").map((message) => markMessageRead(message.id)),
	);
	const readMessageIds = new Set(readResults.flatMap((result) => ("data" in result ? [result.data.id] : [])));
	const messages = messagesResult.data.map((message) =>
		readMessageIds.has(message.id) ? { ...message, status: "READ" as const } : message,
	);

	return (
		<section>
			<h1 className="font-bold text-3xl tracking-tight">Messages</h1>
			<TabSwitch activeTab={tab} />
			{messages.length === 0 ? (
				<p className="mt-8 rounded-xl border border-border bg-surface p-6 text-center text-text-mute">
					{tab === "arsip" ? "Belum ada pesan diarsipkan." : "Belum ada pesan masuk."}
				</p>
			) : (
				<div className="mt-8 space-y-4">
					{messages.map((message) => (
						<MessageCard key={message.id} message={message} />
					))}
				</div>
			)}
		</section>
	);
}
