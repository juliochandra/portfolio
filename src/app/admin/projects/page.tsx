import { ProjectList } from "@/components/admin/projects/ProjectList";
import { getProjectsAdminPage } from "@/features/projects/projects.action";

type ProjectsPageProps = {
	searchParams: Promise<{ message?: string; page?: string }>;
};

function getRequestedPage(page: string | undefined): number {
	const requestedPage = Number(page);
	return Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
	const { message, page } = await searchParams;
	const projectsResult = await getProjectsAdminPage(getRequestedPage(page));
	if ("error" in projectsResult) {
		return null;
	}

	return (
		<ProjectList
			currentPage={projectsResult.data.currentPage}
			projects={projectsResult.data.projects}
			successMessage={message === "saved" ? "Project tersimpan." : undefined}
			totalPages={projectsResult.data.totalPages}
		/>
	);
}
