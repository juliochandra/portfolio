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

	async function updateMessageStatus() {
		"use server";
		await (isArchived ? unarchiveMessage(message.id) : archiveMessage(message.id));
	}

	return (
		<article className="rounded-xl border border-border bg-canvas p-5 sm:p-6">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<div className="flex items-center gap-2">
						{isUnread ? (
							<span className="size-2 rounded-full bg-accent">
								<span className="sr-only">Belum dibaca</span>
							</span>
						) : null}
						<h2 className={isUnread ? "font-bold" : "font-semibold"}>{message.name}</h2>
					</div>
					<a href={`mailto:${message.email}`} className="mt-1 inline-block text-accent text-sm hover:underline">
						{message.email}
					</a>
				</div>
				<time dateTime={message.createdAt} className="text-sm text-text-mute">
					{formatCreatedAt(message.createdAt)}
				</time>
			</div>
			<p className="mt-5 whitespace-pre-wrap text-text-mute">{message.message}</p>
			<form action={updateMessageStatus} className="mt-5">
				<Button type="submit" variant="secondary">
					{isArchived ? "Kembalikan" : "Arsipkan"}
				</Button>
			</form>
		</article>
	);
}
