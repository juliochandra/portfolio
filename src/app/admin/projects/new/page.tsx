import { ProjectForm } from "@/app/admin/projects/_components/ProjectForm";
import { getMediaFolders, getMediaGalleryPage } from "@/features/media/media.action";
import { getSkillsAdmin } from "@/features/skills/skills.action";
import { getTagsAdmin } from "@/features/tags/tags.action";

export default async function NewProjectPage() {
	const [foldersResult, mediaResult, skillsResult, tagsResult] = await Promise.all([
		getMediaFolders(),
		getMediaGalleryPage({ folderId: null, page: 1 }),
		getSkillsAdmin(),
		getTagsAdmin(),
	]);
	if ("error" in foldersResult || "error" in mediaResult || "error" in skillsResult || "error" in tagsResult) {
		return null;
	}

	return (
		<ProjectForm
			folders={foldersResult.data}
			media={mediaResult.data.media}
			mediaCurrentPage={mediaResult.data.currentPage}
			mediaTotalPages={mediaResult.data.totalPages}
			skills={skillsResult.data}
			tags={tagsResult.data}
		/>
	);
}
