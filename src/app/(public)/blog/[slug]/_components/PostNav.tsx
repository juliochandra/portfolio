import Link from "next/link";
import type { PublicPostNavigationItem } from "@/features/posts/posts.type";

type PostNavProps = {
	nextPost: PublicPostNavigationItem | null;
	prevPost: PublicPostNavigationItem | null;
};

export function PostNav({ nextPost, prevPost }: PostNavProps) {
	if (!prevPost && !nextPost) {
		return null;
	}

	return (
		<nav className="mt-12 grid gap-4 border-border border-t pt-8 sm:grid-cols-2" aria-label="Navigasi tulisan">
			{prevPost ? (
				<Link href={`/blog/${prevPost.slug}`} className="rounded-xl border border-border p-5 hover:bg-surface">
					<p className="font-semibold text-accent text-sm">← Tulisan Sebelumnya</p>
					<p className="mt-2 font-bold">{prevPost.title}</p>
				</Link>
			) : null}
			{nextPost ? (
				<Link href={`/blog/${nextPost.slug}`} className="rounded-xl border border-border p-5 text-right hover:bg-surface">
					<p className="font-semibold text-accent text-sm">Tulisan Selanjutnya →</p>
					<p className="mt-2 font-bold">{nextPost.title}</p>
				</Link>
			) : null}
		</nav>
	);
}
