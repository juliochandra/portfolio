import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostNav } from "@/app/(public)/blog/[slug]/_components/PostNav";
import { ShareLinks } from "@/app/(public)/blog/[slug]/_components/ShareLinks";
import { getPostBySlug } from "@/features/posts/posts.action";
import { BackLink } from "@/shared/components/BackLink";
import { Section } from "@/shared/components/Section";
import { SkillTag } from "@/shared/components/SkillTag";
import { sanitizeRichText } from "@/shared/rich-text";

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
			<h1 className="mt-5 w-full font-bold text-4xl tracking-tight sm:text-6xl">{post.title}</h1>
			{post.description ? <p className="mt-6 w-full text-text-mute text-xl leading-8">{post.description}</p> : null}

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
				<div className="mx-auto mt-10 w-fit max-w-full overflow-hidden rounded-2xl border border-border bg-surface p-2">
					{/* biome-ignore lint/performance/noImgElement: URL gambar sampul dikelola admin dan dapat berasal dari host mana pun. */}
					<img src={post.thumbnailImage} alt={`Gambar sampul ${post.title}`} className="max-w-full rounded-xl" />
				</div>
			) : null}

			<article className="mt-12 w-full text-text-mute leading-8">
				<div
					className="w-full whitespace-pre-wrap [&_a]:text-accent [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-accent [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-surface [&_code]:px-1.5 [&_h1]:mt-10 [&_h1]:font-bold [&_h1]:text-4xl [&_h2]:mt-8 [&_h2]:font-bold [&_h2]:text-3xl [&_h3]:mt-6 [&_h3]:font-bold [&_h3]:text-2xl [&_h4]:mt-5 [&_h4]:font-bold [&_h4]:text-xl [&_h5]:mt-4 [&_h5]:font-bold [&_h5]:text-lg [&_hr]:my-8 [&_img]:mx-auto [&_img]:my-6 [&_img]:block [&_img]:max-w-full [&_img]:rounded-xl [&_mark]:rounded [&_mark]:px-1 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-surface [&_pre]:p-4 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized by sanitizeRichText before rendering.
					dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
				/>
			</article>
			<PostNav prevPost={post.prevPost} nextPost={post.nextPost} />
			<ShareLinks title={post.title} />
		</Section>
	);
}
