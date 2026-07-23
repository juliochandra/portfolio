import { notFound } from "next/navigation";
import { PostForm } from "@/app/admin/posts/_components/PostForm";
import { getMediaFolders, getMediaGallery } from "@/features/media/media.action";
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
		getMediaGallery(),
		getTagsAdmin(),
	]);
	if ("error" in foldersResult || "error" in postResult || "error" in mediaResult || "error" in tagsResult) {
		notFound();
	}

	return <PostForm folders={foldersResult.data} post={postResult.data} media={mediaResult.data} tags={tagsResult.data} />;
}
