import { ProjectForm } from "@/app/admin/projects/_components/ProjectForm";
import { getMediaGallery } from "@/features/media/media.action";
import { getSkillsAdmin } from "@/features/skills/skills.action";
import { getTagsAdmin } from "@/features/tags/tags.action";

export default async function NewProjectPage() {
	const [mediaResult, skillsResult, tagsResult] = await Promise.all([getMediaGallery(), getSkillsAdmin(), getTagsAdmin()]);
	if ("error" in mediaResult || "error" in skillsResult || "error" in tagsResult) {
		return null;
	}

	return <ProjectForm media={mediaResult.data} skills={skillsResult.data} tags={tagsResult.data} />;
}
