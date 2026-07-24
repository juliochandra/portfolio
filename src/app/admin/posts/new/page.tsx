import { PostForm } from "@/app/admin/posts/_components/PostForm";
import { getMediaFolders, getMediaGalleryPage } from "@/features/media/media.action";
import { getTagsAdmin } from "@/features/tags/tags.action";

export default async function NewPostPage() {
	const [foldersResult, mediaResult, tagsResult] = await Promise.all([
		getMediaFolders(),
		getMediaGalleryPage({ folderId: null, page: 1 }),
		getTagsAdmin(),
	]);
	if ("error" in foldersResult || "error" in mediaResult || "error" in tagsResult) {
		return null;
	}

	return (
		<PostForm
			folders={foldersResult.data}
			media={mediaResult.data.media}
			mediaCurrentPage={mediaResult.data.currentPage}
			mediaTotalPages={mediaResult.data.totalPages}
			tags={tagsResult.data}
		/>
	);
}
