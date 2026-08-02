import Link from "next/link";
import { TagList } from "@/components/ui/TagList";
import type { PublicPostListItem } from "@/features/posts/posts.services";

type PostItemProps = {
	post: PublicPostListItem;
};

function formatDate(value: string): string {
	return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export function PostItem({ post }: PostItemProps) {
	return (
		<article className="border-border border-b first:border-t">
			<Link href={`/blog/${post.slug}`} className="grid py-4 sm:items-center sm:gap-4 md:grid-cols-[1fr_20rem] md:gap-16">
				<div>
					<p className="text-sm text-text-mute">
						{formatDate(post.publishedAt)}{" "}
						<span className="px-2" aria-hidden="true">
							&bull;
						</span>{" "}
						{post.readingTime} menit baca
					</p>
					<h3 className="my-3 font-bold text-2xl tracking-tight hover:text-accent">{post.title}</h3>

					{post.description ? <p className="my-3 line-clamp-2 text-text-mute leading-7">{post.description}</p> : null}

					<TagList label={`Tag untuk ${post.title}`} names={post.tags.map((tag) => tag.name)} />
				</div>
				{post.thumbnailImage ? (
					/* biome-ignore lint/performance/noImgElement: URL gambar dikelola admin dan dapat berasal dari host mana pun. */
					<img src={post.thumbnailImage} alt="" className="aspect-video w-full rounded-lg object-cover" />
				) : null}
			</Link>
		</article>
	);
}
