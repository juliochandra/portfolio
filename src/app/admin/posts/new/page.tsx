import { PostForm } from "@/app/admin/posts/_components/PostForm";
import { getMediaGallery } from "@/features/media/media.action";
import { getTagsAdmin } from "@/features/tags/tags.action";

export default async function NewPostPage() {
	const [mediaResult, tagsResult] = await Promise.all([getMediaGallery(), getTagsAdmin()]);
	if ("error" in mediaResult || "error" in tagsResult) {
		return null;
	}

	return <PostForm media={mediaResult.data} tags={tagsResult.data} />;
}
