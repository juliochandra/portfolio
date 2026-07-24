import { FaArrowRotateLeft, FaBoxArchive, FaChevronDown } from "react-icons/fa6";
import { archiveMessage, unarchiveMessage } from "@/features/messages/messages.action";
import { Button } from "@/shared/components/Button";

type MessageCardProps = {
	message: {
		createdAt: string;
		email: string;
		id: string;
		message: string;
		name: string;
		status: "ARCHIVED" | "READ" | "UNREAD";
	};
};

function formatCreatedAt(value: string): string {
	return new Intl.DateTimeFormat("id-ID", {
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		month: "long",
		year: "numeric",
	}).format(new Date(value));
}

export function MessageCard({ message }: MessageCardProps) {
	const isArchived = message.status === "ARCHIVED";
	const isUnread = message.status === "UNREAD";
	const senderInitial = message.name.trim().charAt(0).toUpperCase() || "?";

	async function updateMessageStatus() {
		"use server";
		await (isArchived ? unarchiveMessage(message.id) : archiveMessage(message.id));
	}

	return (
		<article className={isUnread ? "bg-accent/5" : "bg-canvas"}>
			<details className="group">
				<summary className="flex cursor-pointer list-none items-center gap-2 p-2.5 sm:px-3 [&::-webkit-details-marker]:hidden">
					<span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/10 font-medium text-accent text-xs">
						{senderInitial}
					</span>
					<div className="flex min-w-0 flex-1 items-center gap-2">
						<h2 className={`shrink-0 truncate ${isUnread ? "font-bold" : "font-semibold"}`}>{message.name}</h2>
						{isUnread ? (
							<>
								<span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
								<span className="sr-only">Pesan baru</span>
							</>
						) : null}
						<span aria-hidden="true" className="hidden shrink-0 text-border sm:inline">
							•
						</span>
						<span className="hidden max-w-48 shrink-0 truncate text-accent sm:inline">{message.email}</span>
						<span aria-hidden="true" className="hidden shrink-0 text-border md:inline">
							•
						</span>
						<span className="hidden min-w-0 truncate text-sm text-text-mute md:inline">{message.message}</span>
					</div>
					<div className="flex shrink-0 items-center gap-2 text-text-mute">
						<time className="hidden text-sm lg:block" dateTime={message.createdAt}>
							{formatCreatedAt(message.createdAt)}
						</time>
						<FaChevronDown aria-hidden="true" className="transition-transform group-open:rotate-180" />
					</div>
				</summary>
				<div className="border-border border-t px-3 pt-3 pb-3 sm:px-4 sm:pb-4">
					<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-mute">
						<a className="text-accent hover:underline" href={`mailto:${message.email}`}>
							{message.email}
						</a>
						<time dateTime={message.createdAt}>{formatCreatedAt(message.createdAt)}</time>
					</div>
					<p className="mt-3 whitespace-pre-wrap text-text-mute leading-7">{message.message}</p>
					<form action={updateMessageStatus} className="mt-4 flex justify-end">
						<Button
							className="inline-flex items-center gap-2"
							icon={isArchived ? <FaArrowRotateLeft aria-hidden="true" /> : <FaBoxArchive aria-hidden="true" />}
							type="submit"
							variant="secondary"
						>
							{isArchived ? "Kembalikan" : "Arsipkan"}
						</Button>
					</form>
				</div>
			</details>
		</article>
	);
}
