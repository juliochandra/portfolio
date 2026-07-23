import { PostList } from "@/app/admin/posts/_components/PostList";
import { getPostsAdmin } from "@/features/posts/posts.action";

type PostsPageProps = {
	searchParams: Promise<{ message?: string }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
	const [postsResult, { message }] = await Promise.all([getPostsAdmin(), searchParams]);
	if ("error" in postsResult) {
		return null;
	}

	return <PostList posts={postsResult.data} successMessage={message === "saved" ? "Tulisan tersimpan." : undefined} />;
}
