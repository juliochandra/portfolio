import { PostForm } from "@/app/admin/posts/_components/PostForm";
import { getMediaFolders, getMediaGallery } from "@/features/media/media.action";
import { getTagsAdmin } from "@/features/tags/tags.action";

export default async function NewPostPage() {
	const [foldersResult, mediaResult, tagsResult] = await Promise.all([getMediaFolders(), getMediaGallery(), getTagsAdmin()]);
	if ("error" in foldersResult || "error" in mediaResult || "error" in tagsResult) {
		return null;
	}

	return <PostForm folders={foldersResult.data} media={mediaResult.data} tags={tagsResult.data} />;
}
