import { ProjectList } from "@/app/admin/projects/_components/ProjectList";
import { getProjectsAdmin } from "@/features/projects/projects.action";

type ProjectsPageProps = {
	searchParams: Promise<{ message?: string }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
	const [projectsResult, { message }] = await Promise.all([getProjectsAdmin(), searchParams]);
	if ("error" in projectsResult) {
		return null;
	}

	return (
		<ProjectList projects={projectsResult.data} successMessage={message === "saved" ? "Project tersimpan." : undefined} />
	);
}
