import type { Metadata } from "next";
import { FaBookOpen, FaClock, FaPenNib } from "react-icons/fa";
import { PostItem } from "@/components/content/PostItem";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { getPosts } from "@/features/posts/posts.action";

export const metadata: Metadata = {
	title: "Blog",
	description: "Tulisan Julio Chandra tentang pengembangan web dan produk digital.",
};

function getFirstPublishedYear(posts: Awaited<ReturnType<typeof getPosts>>["data"]): number | null {
	if (posts.length === 0) {
		return null;
	}

	return Math.min(...posts.map((post) => new Date(post.publishedAt).getFullYear()));
}

export default async function BlogPage() {
	const postsResult = await getPosts();
	const posts = postsResult.data;
	const totalReadingTime = posts.reduce((total, post) => total + post.readingTime, 0);
	const firstPublishedYear = getFirstPublishedYear(posts);

	return (
		<>
			<Section>
				<div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
					<div>
						<SectionHeader
							align="left"
							badge="Blog"
							name="Blog"
							title="Catatan dari Proses Membangun"
							description="Tulisan seputar pengembangan web, produk digital, dan hal yang saya pelajari."
						/>
						<p className="mt-8 text-text-mute leading-8">
							Saya membagikan pengalaman dan catatan yang dapat membantu proses membangun produk menjadi lebih terarah.
						</p>
					</div>
					<div className="mx-auto aspect-square w-full max-w-sm rounded-2xl border border-border bg-surface p-2">
						{/* biome-ignore lint/performance/noImgElement: Gambar Blog memakai URL eksternal statis. */}
						<img
							src="https://picsum.photos/800/800"
							alt="Ilustrasi Blog Julio Chandra"
							className="aspect-square w-full rounded-xl object-cover"
						/>
					</div>
				</div>
				<div className="mt-12 grid gap-4 sm:grid-cols-3">
					<StatCard
						icon={FaBookOpen}
						value={`${posts.length}+`}
						label="Tulisan"
						description="Catatan yang telah diterbitkan."
					/>
					<StatCard
						icon={FaClock}
						value={`${totalReadingTime}+`}
						label="Menit Bacaan"
						description="Estimasi waktu baca seluruh tulisan."
					/>
					<StatCard
						icon={FaPenNib}
						value={firstPublishedYear ? `${firstPublishedYear}-Sekarang` : "-"}
						label="Perjalanan Menulis"
						description="Catatan yang terus bertambah dari waktu ke waktu."
					/>
				</div>
			</Section>

			<Section>
				<SectionHeader
					align="left"
					badge="Tulisan"
					title="Semua Tulisan"
					description="Kumpulan pemikiran, pembelajaran, dan pengalaman dari proses membangun produk."
				/>
				{posts.length > 0 ? (
					<div className="mt-12">
						{posts.map((post) => (
							<PostItem key={post.id} post={post} />
						))}
					</div>
				) : (
					<p className="mt-12 text-center text-text-mute">Belum ada tulisan.</p>
				)}
			</Section>
		</>
	);
}
