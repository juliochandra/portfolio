import { TagsManager } from "@/app/admin/tags/_components/TagsManager";
import { getTagsAdmin } from "@/features/tags/tags.action";

export default async function TagsPage() {
	const tagsResult = await getTagsAdmin();
	if ("error" in tagsResult) {
		return null;
	}

	return <TagsManager initialTags={tagsResult.data} />;
}
