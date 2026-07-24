import { notFound } from "next/navigation";
import { PostForm } from "@/app/admin/posts/_components/PostForm";
import { getMediaFolders, getMediaGalleryPage } from "@/features/media/media.action";
import { getPostAdmin } from "@/features/posts/posts.action";
import { getTagsAdmin } from "@/features/tags/tags.action";

type EditPostPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
	const { id } = await params;
	const [foldersResult, postResult, mediaResult, tagsResult] = await Promise.all([
		getMediaFolders(),
		getPostAdmin(id),
		getMediaGalleryPage({ folderId: null, page: 1 }),
		getTagsAdmin(),
	]);
	if ("error" in foldersResult || "error" in postResult || "error" in mediaResult || "error" in tagsResult) {
		notFound();
	}

	return (
		<PostForm
			folders={foldersResult.data}
			media={mediaResult.data.media}
			mediaCurrentPage={mediaResult.data.currentPage}
			mediaTotalPages={mediaResult.data.totalPages}
			post={postResult.data}
			tags={tagsResult.data}
		/>
	);
}
