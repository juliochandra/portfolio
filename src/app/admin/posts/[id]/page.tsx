import { notFound } from "next/navigation";
import { PostForm } from "@/app/admin/posts/_components/PostForm";
import { getMediaGallery } from "@/features/media/media.action";
import { getPostAdmin } from "@/features/posts/posts.action";
import { getTagsAdmin } from "@/features/tags/tags.action";

type EditPostPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
	const { id } = await params;
	const [postResult, mediaResult, tagsResult] = await Promise.all([getPostAdmin(id), getMediaGallery(), getTagsAdmin()]);
	if ("error" in postResult || "error" in mediaResult || "error" in tagsResult) {
		notFound();
	}

	return <PostForm post={postResult.data} media={mediaResult.data} tags={tagsResult.data} />;
}
