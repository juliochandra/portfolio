import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostNav } from "@/app/(public)/blog/[slug]/_components/PostNav";
import { ShareLinks } from "@/app/(public)/blog/[slug]/_components/ShareLinks";
import { getPostBySlug } from "@/features/posts/posts.action";
import { BackLink } from "@/shared/components/BackLink";
import { Section } from "@/shared/components/Section";
import { SkillTag } from "@/shared/components/SkillTag";

type PostDetailPageProps = {
	params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
	title: "Blog",
	description: "Tulisan Julio Chandra.",
};

function formatPublishedDate(publishedAt: string): string {
	return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(publishedAt));
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
	const { slug } = await params;
	const result = await getPostBySlug(slug);

	if ("error" in result) {
		notFound();
	}

	const post = result.data;

	return (
		<Section>
			<BackLink href="/blog" label="Kembali ke Blog" />
			<p className="mt-10 text-sm text-text-mute">
				{formatPublishedDate(post.publishedAt)}
				<span className="px-2" aria-hidden="true">
					•
				</span>
				{post.readingTime} menit baca
			</p>
			<h1 className="mt-5 max-w-4xl font-bold text-4xl tracking-tight sm:text-6xl">{post.title}</h1>
			{post.description ? <p className="mt-6 max-w-3xl text-text-mute text-xl leading-8">{post.description}</p> : null}

			{post.tags.length > 0 ? (
				<ul className="mt-8 flex flex-wrap gap-2" aria-label={`Tag untuk ${post.title}`}>
					{post.tags.map((tag) => (
						<li key={tag.name}>
							<SkillTag name={tag.name} />
						</li>
					))}
				</ul>
			) : null}

			{post.thumbnailImage ? (
				<div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface p-2">
					{/* biome-ignore lint/performance/noImgElement: URL gambar sampul dikelola admin dan dapat berasal dari host mana pun. */}
					<img
						src={post.thumbnailImage}
						alt={`Gambar sampul ${post.title}`}
						className="aspect-video w-full rounded-xl object-cover"
					/>
				</div>
			) : null}

			<article className="mt-12 max-w-3xl whitespace-pre-wrap text-text-mute leading-8">{post.content}</article>
			<PostNav prevPost={post.prevPost} nextPost={post.nextPost} />
			<ShareLinks title={post.title} />
		</Section>
	);
}
