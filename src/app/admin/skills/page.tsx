import { SkillsManager } from "@/app/admin/skills/_components/SkillsManager";
import { getSkillsAdmin } from "@/features/skills/skills.action";

export default async function SkillsPage() {
	const skillsResult = await getSkillsAdmin();
	if ("error" in skillsResult) {
		return null;
	}

	return <SkillsManager initialSkills={skillsResult.data} />;
}
