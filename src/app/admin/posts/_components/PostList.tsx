"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePost } from "@/features/posts/posts.action";
import { Button } from "@/shared/components/Button";
import { ManageRow } from "@/shared/components/ManageRow";
import { StatusMessage } from "@/shared/components/StatusMessage";
import type { PublishStatus } from "@/shared/publish-status";

type PostListItem = {
	createdAt: string;
	id: string;
	status: PublishStatus;
	title: string;
};

type PostListProps = {
	posts: PostListItem[];
	successMessage?: string;
};

function formatCreatedAt(value: string): string {
	return new Intl.DateTimeFormat("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date(value));
}

export function PostList({ posts, successMessage }: PostListProps) {
	const router = useRouter();
	const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(
		successMessage ? { text: successMessage, type: "success" } : null,
	);

	async function handleDelete(id: string) {
		const result = await deletePost(id);
		if ("error" in result) {
			setMessage({ text: result.error.message, type: "error" });
			return;
		}

		setMessage({ text: "Tulisan terhapus.", type: "success" });
		router.refresh();
	}

	return (
		<section>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h1 className="font-bold text-3xl tracking-tight">Posts</h1>
				<Button type="button" onClick={() => router.push("/admin/posts/new")}>
					+ Tulis Tulisan
				</Button>
			</div>
			{message ? <StatusMessage message={message.text} type={message.type} /> : null}
			{posts.length === 0 ? (
				<p className="mt-10 rounded-xl border border-border bg-surface p-6 text-text-mute">
					Belum ada tulisan. Tulis yang pertama.
				</p>
			) : (
				<div className="mt-6 rounded-xl border border-border bg-canvas px-5 sm:px-6">
					{posts.map((post) => (
						<ManageRow
							key={post.id}
							description={formatCreatedAt(post.createdAt)}
							editHref={`/admin/posts/${post.id}`}
							itemType="tulisan"
							onDelete={() => handleDelete(post.id)}
							status={post.status}
							title={post.title}
						/>
					))}
				</div>
			)}
		</section>
	);
}
