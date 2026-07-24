import { SkillsManager } from "@/app/admin/skills/_components/SkillsManager";
import { getMediaFolders, getMediaGalleryPage } from "@/features/media/media.action";
import { getSkillsAdmin } from "@/features/skills/skills.action";

export default async function SkillsPage() {
	const [foldersResult, mediaResult, skillsResult] = await Promise.all([
		getMediaFolders(),
		getMediaGalleryPage({ folderId: null, page: 1 }),
		getSkillsAdmin(),
	]);
	if ("error" in foldersResult || "error" in mediaResult || "error" in skillsResult) {
		return null;
	}

	return (
		<SkillsManager
			folders={foldersResult.data}
			initialSkills={skillsResult.data}
			media={mediaResult.data.media}
			mediaCurrentPage={mediaResult.data.currentPage}
			mediaTotalPages={mediaResult.data.totalPages}
		/>
	);
}
