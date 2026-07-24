import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CiExport } from "react-icons/ci";
import { SiGithub } from "react-icons/si";
import { getProjectBySlug } from "@/features/projects/projects.action";
import { BackLink } from "@/shared/components/BackLink";
import { Section } from "@/shared/components/Section";
import { SkillTag } from "@/shared/components/SkillTag";

type ProjectDetailPageProps = {
	params: Promise<{ slug: string }>;
};

function formatPublishedDate(publishedAt: Date | null): string {
	if (!publishedAt) {
		return "Tanggal tidak tersedia";
	}

	return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(publishedAt);
}

export const metadata: Metadata = {
	title: "Portfolio",
	description: "Detail project Julio Chandra.",
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
	const { slug } = await params;
	const result = await getProjectBySlug(slug);

	if ("error" in result) {
		notFound();
	}

	const project = result.data;

	return (
		<Section>
			<BackLink href="/portfolio" label="Kembali ke Portfolio" />
			<p className="mt-10 flex w-fit rounded-lg bg-accent/10 px-3 py-1.5 font-semibold text-accent text-sm">
				Published • {formatPublishedDate(project.publishedAt)}
			</p>
			<h1 className="mt-6 max-w-4xl font-bold text-4xl tracking-tight sm:text-6xl">{project.title}</h1>
			{project.description ? <p className="mt-6 max-w-3xl text-text-mute text-xl leading-8">{project.description}</p> : null}

			{project.thumbnailImage ? (
				<div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface p-2">
					{/* biome-ignore lint/performance/noImgElement: URL gambar project dikelola admin dan dapat berasal dari host mana pun. */}
					<img
						src={project.thumbnailImage}
						alt={`Tampilan project ${project.title}`}
						className="aspect-video w-full rounded-xl object-cover"
					/>
				</div>
			) : null}

			{project.skills.length > 0 ? (
				<section className="mt-12" aria-labelledby="project-skills-title">
					<h2 id="project-skills-title" className="font-bold text-2xl tracking-tight">
						Skills &amp; Technologies
					</h2>
					<ul className="mt-5 flex flex-wrap gap-2">
						{project.skills.map((skill) => (
							<li key={skill.name}>
								<SkillTag icon={skill.icon} name={skill.name} />
							</li>
						))}
					</ul>
				</section>
			) : null}

			<section className="mt-12 max-w-3xl" aria-labelledby="project-overview-title">
				<h2 id="project-overview-title" className="font-bold text-2xl tracking-tight">
					Overview
				</h2>
				<div className="mt-5 whitespace-pre-wrap text-text-mute leading-8">{project.content}</div>
			</section>

			{project.tags.length > 0 ? (
				<section className="mt-12" aria-labelledby="project-tags-title">
					<h2 id="project-tags-title" className="font-bold text-2xl tracking-tight">
						Tags
					</h2>
					<ul className="mt-5 flex flex-wrap gap-2">
						{project.tags.map((tag) => (
							<li key={tag.name}>
								<SkillTag name={tag.name} />
							</li>
						))}
					</ul>
				</section>
			) : null}

			{project.demoUrl || project.repositoryUrl ? (
				<div className="mt-12 flex flex-wrap gap-3">
					{project.demoUrl ? (
						<a
							href={project.demoUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-semibold hover:bg-surface"
						>
							<CiExport className="text-xl" aria-hidden="true" />
							Lihat Demo
						</a>
					) : null}
					{project.repositoryUrl ? (
						<a
							href={project.repositoryUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-semibold hover:bg-surface"
						>
							<SiGithub aria-hidden="true" />
							Lihat Kode
						</a>
					) : null}
				</div>
			) : null}
		</Section>
	);
}
