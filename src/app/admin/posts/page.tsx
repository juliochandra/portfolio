import { PostList } from "@/components/admin/posts/PostList";
import { getPostsAdminPage } from "@/features/posts/posts.action";

type PostsPageProps = {
	searchParams: Promise<{ message?: string; page?: string }>;
};

function getRequestedPage(page: string | undefined): number {
	const requestedPage = Number(page);
	return Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
	const { message, page } = await searchParams;
	const postsResult = await getPostsAdminPage(getRequestedPage(page));
	if ("error" in postsResult) {
		return null;
	}

	return (
		<PostList
			currentPage={postsResult.data.currentPage}
			posts={postsResult.data.posts}
			successMessage={message === "saved" ? "Tulisan tersimpan." : undefined}
			totalPages={postsResult.data.totalPages}
		/>
	);
}
