import Link from "next/link";
import { CiExport, CiFolderOn } from "react-icons/ci";
import { SiGithub } from "react-icons/si";
import type { PublicProjectListItem } from "@/features/projects/projects.services";
import { TagList } from "@/shared/components/TagList";

type ProjectCardProps = {
	project: PublicProjectListItem;
};

export function ProjectCard({ project }: ProjectCardProps) {
	const projectHref = `/portfolio/${project.slug}`;

	return (
		<article className="hover:-translate-y-1 flex h-full flex-col overflow-hidden rounded-xl border border-border bg-canvas shadow-sm transition-transform">
			<Link href={projectHref} className="block bg-canvas p-4" aria-label={`Lihat project ${project.title}`}>
				{project.thumbnailImage ? (
					/* biome-ignore lint/performance/noImgElement: URL gambar dikelola admin dan dapat berasal dari host mana pun. */
					<img src={project.thumbnailImage} alt="" className="aspect-video w-full rounded-xl object-cover" />
				) : (
					<div className="grid aspect-video place-items-center text-text-mute">
						<CiFolderOn className="text-5xl" aria-hidden="true" />
					</div>
				)}
			</Link>
			<div className="flex flex-1 flex-col p-4">
				<h3 className="font-bold text-xl">
					<Link href={projectHref} className="hover:text-accent">
						{project.title}
					</Link>
				</h3>

				{project.description ? <p className="mt-3 line-clamp-2 text-text-mute leading-7">{project.description}</p> : null}

				<TagList label={`Keahlian untuk ${project.title}`} names={project.skills.map((skill) => skill.name)} />

				{project.demoUrl || project.repositoryUrl ? (
					<div className="mt-auto flex flex-wrap justify-between border-border border-t pt-2 font-semibold text-sm">
						{project.demoUrl ? (
							<a
								href={project.demoUrl}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1.5 text-accent hover:underline"
							>
								<CiExport className="text-lg" aria-hidden="true" />
								Demo langsung
							</a>
						) : null}
						{project.repositoryUrl ? (
							<a
								href={project.repositoryUrl}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1.5 hover:underline"
							>
								<SiGithub aria-hidden="true" />
								GitHub
							</a>
						) : null}
					</div>
				) : null}
			</div>
		</article>
	);
}
