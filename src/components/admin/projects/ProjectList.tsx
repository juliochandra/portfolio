"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ManageRow } from "@/components/admin/ManageRow";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { deleteProject } from "@/features/projects/projects.action";
import type { PublishStatus } from "@/lib/publish-status";

type ProjectListItem = {
	description: string | null;
	id: string;
	status: PublishStatus;
	title: string;
};

type ProjectListProps = {
	currentPage: number;
	projects: ProjectListItem[];
	successMessage?: string;
	totalPages: number;
};

export function ProjectList({ currentPage, projects, successMessage, totalPages }: ProjectListProps) {
	const router = useRouter();
	const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(
		successMessage ? { text: successMessage, type: "success" } : null,
	);

	async function handleDelete(id: string) {
		const result = await deleteProject(id);
		if ("error" in result) {
			setMessage({ text: result.error.message, type: "error" });
			return;
		}

		setMessage({ text: "Project terhapus.", type: "success" });
		router.refresh();
	}

	return (
		<section>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h1 className="font-bold text-3xl tracking-tight">Projects</h1>
				<Button type="button" onClick={() => router.push("/admin/projects/new")}>
					+ Tambah Project
				</Button>
			</div>
			{message ? <StatusMessage message={message.text} type={message.type} /> : null}
			{projects.length === 0 ? (
				<p className="mt-10 rounded-xl border border-border bg-surface p-6 text-text-mute">
					Belum ada project. Tambahkan yang pertama.
				</p>
			) : (
				<div className="mt-6 rounded-xl border border-border bg-canvas px-5 sm:px-6">
					{projects.map((project) => (
						<ManageRow
							key={project.id}
							description={project.description}
							editHref={`/admin/projects/${project.id}`}
							onDelete={() => handleDelete(project.id)}
							status={project.status}
							title={project.title}
						/>
					))}
				</div>
			)}
			{totalPages > 1 ? (
				<nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination project">
					{currentPage > 1 ? (
						<Link
							className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
							href={`/admin/projects?page=${currentPage - 1}`}
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
							href={`/admin/projects?page=${page}`}
							key={page}
							scroll={false}
						>
							{page}
						</Link>
					))}
					{currentPage < totalPages ? (
						<Link
							className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
							href={`/admin/projects?page=${currentPage + 1}`}
							scroll={false}
						>
							Berikutnya
						</Link>
					) : null}
				</nav>
			) : null}
		</section>
	);
}
