"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProject } from "@/features/projects/projects.action";
import { Button } from "@/shared/components/Button";
import { ManageRow } from "@/shared/components/ManageRow";
import { StatusMessage } from "@/shared/components/StatusMessage";
import type { PublishStatus } from "@/shared/publish-status";

type ProjectListItem = {
	description: string | null;
	id: string;
	status: PublishStatus;
	title: string;
};

type ProjectListProps = {
	projects: ProjectListItem[];
	successMessage?: string;
};

export function ProjectList({ projects, successMessage }: ProjectListProps) {
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
		</section>
	);
}
