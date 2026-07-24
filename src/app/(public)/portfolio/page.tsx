import type { Metadata } from "next";
import Link from "next/link";
import { FaCode, FaFolderOpen, FaHeart } from "react-icons/fa";
import { getProjects } from "@/features/projects/projects.action";
import { ProjectCard } from "@/shared/components/ProjectCard";
import { Section } from "@/shared/components/Section";
import { SectionHeader } from "@/shared/components/SectionHeader";
import { StatCard } from "@/shared/components/StatCard";

const PROJECTS_PER_PAGE = 6;

type PortfolioPageProps = {
	searchParams: Promise<{ page?: string }>;
};

export const metadata: Metadata = {
	title: "Portfolio",
	description: "Koleksi project yang dikerjakan Julio Chandra.",
};

function countUniqueSkills(projects: Awaited<ReturnType<typeof getProjects>>["data"]): number {
	return new Set(projects.flatMap((project) => project.skills.map((skill) => skill.name.toLocaleLowerCase()))).size;
}

function getCurrentPage(page: string | undefined, totalPages: number): number {
	const requestedPage = Number(page);
	if (!Number.isInteger(requestedPage) || requestedPage < 1) {
		return 1;
	}

	return Math.min(requestedPage, totalPages);
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
	if (totalPages < 2) {
		return null;
	}

	return (
		<nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination project">
			{currentPage > 1 ? (
				<Link
					href={`/portfolio?page=${currentPage - 1}`}
					scroll={false}
					className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
				>
					Sebelumnya
				</Link>
			) : null}
			{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
				<Link
					key={page}
					href={`/portfolio?page=${page}`}
					scroll={false}
					className={
						page === currentPage
							? "rounded-md bg-accent px-3 py-2 font-semibold text-sm text-white"
							: "rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
					}
					aria-current={page === currentPage ? "page" : undefined}
				>
					{page}
				</Link>
			))}
			{currentPage < totalPages ? (
				<Link
					href={`/portfolio?page=${currentPage + 1}`}
					scroll={false}
					className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
				>
					Berikutnya
				</Link>
			) : null}
		</nav>
	);
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
	const { page } = await searchParams;
	const projectsResult = await getProjects();
	const projects = projectsResult.data;
	const totalSkills = countUniqueSkills(projects);
	const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));
	const currentPage = getCurrentPage(page, totalPages);
	const firstProjectIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
	const visibleProjects = projects.slice(firstProjectIndex, firstProjectIndex + PROJECTS_PER_PAGE);

	return (
		<>
			<Section>
				<div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
					<div>
						<SectionHeader
							align="left"
							badge="Portfolio"
							name="Portfolio"
							title="Project yang Saya Kerjakan"
							description="Koleksi project yang saya kerjakan."
						/>
						<p className="mt-8 text-text-mute leading-8">
							Setiap project dibangun dengan perhatian pada kebutuhan pengguna, fondasi teknis yang kuat, dan detail yang
							mudah dikembangkan.
						</p>
					</div>
					<div className="mx-auto aspect-square w-full max-w-sm rounded-2xl border border-border bg-surface p-2">
						{/* biome-ignore lint/performance/noImgElement: Gambar Portfolio memakai URL eksternal statis. */}
						<img
							src="https://picsum.photos/800/800"
							alt="Ilustrasi Portfolio Julio Chandra"
							className="aspect-square w-full rounded-xl object-cover"
						/>
					</div>
				</div>
				<div className="mt-12 grid gap-4 sm:grid-cols-3">
					<StatCard
						icon={FaFolderOpen}
						value={`${projects.length}+`}
						label="Project"
						description="Karya yang telah diterbitkan."
					/>
					<StatCard
						icon={FaCode}
						value={`${totalSkills}+`}
						label="Teknologi"
						description="Teknologi yang digunakan di berbagai project."
					/>
					<StatCard
						icon={FaHeart}
						value="100%"
						label="Dikerjakan Sepenuh Hati"
						description="Komitmen pada setiap detail yang dibangun."
					/>
				</div>
			</Section>

			<Section>
				<SectionHeader
					align="left"
					badge="Projects"
					title="Semua Project"
					description="Berikut adalah semua project terbit yang dapat Anda jelajahi."
				/>
				{visibleProjects.length > 0 ? (
					<div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
						{visibleProjects.map((project) => (
							<ProjectCard key={project.id} project={project} />
						))}
					</div>
				) : (
					<p className="mt-12 text-center text-text-mute">Belum ada project untuk ditampilkan.</p>
				)}
				<Pagination currentPage={currentPage} totalPages={totalPages} />
			</Section>
		</>
	);
}
