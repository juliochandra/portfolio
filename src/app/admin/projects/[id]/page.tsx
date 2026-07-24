import { notFound } from "next/navigation";
import { ProjectForm } from "@/app/admin/projects/_components/ProjectForm";
import { getMediaFolders, getMediaGallery } from "@/features/media/media.action";
import { getProjectAdmin } from "@/features/projects/projects.action";
import { getSkillsAdmin } from "@/features/skills/skills.action";
import { getTagsAdmin } from "@/features/tags/tags.action";

type EditProjectPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
	const { id } = await params;
	const [foldersResult, projectResult, mediaResult, skillsResult, tagsResult] = await Promise.all([
		getMediaFolders(),
		getProjectAdmin(id),
		getMediaGallery(),
		getSkillsAdmin(),
		getTagsAdmin(),
	]);
	if (
		"error" in foldersResult ||
		"error" in projectResult ||
		"error" in mediaResult ||
		"error" in skillsResult ||
		"error" in tagsResult
	) {
		notFound();
	}

	return (
		<ProjectForm
			folders={foldersResult.data}
			project={projectResult.data}
			media={mediaResult.data}
			skills={skillsResult.data}
			tags={tagsResult.data}
		/>
	);
}
