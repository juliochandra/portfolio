import { TagsManager } from "@/components/admin/tags/TagsManager";
import { getTagsAdmin } from "@/features/tags/tags.action";

export default async function TagsPage() {
	const tagsResult = await getTagsAdmin();
	if ("error" in tagsResult) {
		return null;
	}

	return <TagsManager initialTags={tagsResult.data} />;
}
