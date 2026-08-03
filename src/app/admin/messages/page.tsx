import Link from "next/link";
import { MessageCard } from "@/app/admin/messages/_components/MessageCard";
import { TabSwitch } from "@/app/admin/messages/_components/TabSwitch";
import { getMessagesPage, markMessageRead } from "@/features/messages/messages.action";
import type { MessageTab } from "@/features/messages/messages.type";

type MessagesPageProps = {
	searchParams: Promise<{ page?: string; tab?: string }>;
};

function getMessageTab(tab: string | undefined): MessageTab {
	return tab === "arsip" ? "arsip" : "aktif";
}

function getMessagePage(page: string | undefined): number {
	const parsedPage = Number(page);
	return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
	const { page: requestedPage, tab: requestedTab } = await searchParams;
	const tab = getMessageTab(requestedTab);
	const messagesResult = await getMessagesPage({ page: getMessagePage(requestedPage), tab });
	if ("error" in messagesResult) {
		return null;
	}

	await Promise.all(
		messagesResult.data.messages
			.filter((message) => message.status === "UNREAD")
			.map((message) => markMessageRead(message.id)),
	);
	const { currentPage, messages, totalPages } = messagesResult.data;

	return (
		<section className="w-full">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Messages</h1>
				<p className="mt-1 text-sm text-text-mute">
					{tab === "arsip" ? "Pesan yang sudah diarsipkan." : "Pesan dari formulir Contact."}
				</p>
			</div>
			<TabSwitch activeTab={tab} />
			{messages.length === 0 ? (
				<p className="mt-8 rounded-xl border border-border bg-surface p-6 text-center text-text-mute">
					{tab === "arsip" ? "Belum ada pesan diarsipkan." : "Belum ada pesan masuk."}
				</p>
			) : (
				<div className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border">
					{messages.map((message) => (
						<MessageCard key={message.id} message={message} />
					))}
				</div>
			)}
			{totalPages > 1 ? <MessagesPagination currentPage={currentPage} tab={tab} totalPages={totalPages} /> : null}
		</section>
	);
}

function MessagesPagination({ currentPage, tab, totalPages }: { currentPage: number; tab: MessageTab; totalPages: number }) {
	function getPageHref(page: number): string {
		return `/admin/messages?tab=${tab}&page=${page}`;
	}

	return (
		<nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination pesan">
			{currentPage > 1 ? (
				<Link
					className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
					href={getPageHref(currentPage - 1)}
					scroll={false}
				>
					Sebelumnya
				</Link>
			) : null}
			{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
				<Link
					aria-current={page === currentPage ? "page" : undefined}
					className={
						page === currentPage
							? "rounded-md bg-accent px-3 py-2 font-semibold text-sm text-white"
							: "rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
					}
					href={getPageHref(page)}
					key={page}
					scroll={false}
				>
					{page}
				</Link>
			))}
			{currentPage < totalPages ? (
				<Link
					className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
					href={getPageHref(currentPage + 1)}
					scroll={false}
				>
					Berikutnya
				</Link>
			) : null}
		</nav>
	);
}
