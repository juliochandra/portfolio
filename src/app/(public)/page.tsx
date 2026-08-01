import type { Metadata } from "next";
import { CiMail } from "react-icons/ci";
import { SkillCard } from "@/app/(public)/_components/SkillCard";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { getContactInfo } from "@/features/contact/contact.action";
import { getPosts } from "@/features/posts/posts.action";
import { getProjects } from "@/features/projects/projects.action";
import { getSkills } from "@/features/skills/skills.action";
import { ButtonLink } from "@/shared/components/ButtonLink";
import { PostItem } from "@/shared/components/PostItem";
import { ProjectCard } from "@/shared/components/ProjectCard";

export const metadata: Metadata = {
	title: "Home",
	description: "Portfolio Julio Chandra, pengembang web full-stack.",
};

function isEmailContact(contact: { label: string; value: string }): boolean {
	return contact.label.toLowerCase().includes("email") || contact.value.startsWith("mailto:") || contact.value.includes("@");
}

export default async function Home() {
	const [projectsResult, postsResult, skillsResult] = await Promise.all([
		getProjects({ limit: 3 }),
		getPosts({ limit: 3 }),
		getSkills(),
	]);
	const contactResult = await getContactInfo();
	const email = contactResult.data.find(isEmailContact);
	const emailHref = email ? (email.value.startsWith("mailto:") ? email.value : `mailto:${email.value}`) : "test@mail.com";

	return (
		<>
			<Section>
				<SectionHeader
					badge="&lt;/&gt; Halo, saya"
					name="JULIO."
					title="Pengembang Web Full-stack"
					description="Saya membangun aplikasi web modern, cepat, dan responsif dengan kode yang rapi serta pengalaman pengguna yang
					baik."
				/>

				<div className="mt-8 flex flex-wrap justify-center gap-3">
					<ButtonLink href="/portfolio" size="lg">
						Lihat Portfolio
					</ButtonLink>
					<ButtonLink href="/contact" size="lg" variant="secondary">
						Hubungi Saya
					</ButtonLink>
				</div>
			</Section>

			<Section>
				<SectionHeader
					badge="Keahlian"
					title="Teknologi yang Saya Kuasai"
					description="Beberapa teknologi dan tools yang saya gunakan untuk membangun aplikasi web yang modern, andal, dan skalabel."
				/>
				{skillsResult.data.length > 0 ? (
					<ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
						{skillsResult.data.map((skill) => (
							<SkillCard key={skill.id} skill={skill} />
						))}
					</ul>
				) : (
					<p className="mt-12 text-center text-text-mute">Belum ada skill yang ditampilkan.</p>
				)}
			</Section>

			<Section>
				<SectionHeader
					badge="Portfolio"
					title="Project Unggulan"
					description="Beberapa project yang pernah saya kerjakan - masing-masing dibangun dengan fokus pada performa, skalabilitas, dan pengalaman pengguna yang baik."
				/>
				{projectsResult.data.length > 0 ? (
					<div className="mt-12 grid gap-6 lg:grid-cols-3">
						{projectsResult.data.map((project) => (
							<ProjectCard key={project.id} project={project} />
						))}
					</div>
				) : (
					<p className="mt-12 text-center text-text-mute">Belum ada project yang ditampilkan.</p>
				)}
				<div className="mt-10 text-center">
					<ButtonLink href="/portfolio" size="lg" variant="outline">
						Lihat Semua Project &rarr;
					</ButtonLink>
				</div>
			</Section>

			<Section>
				<SectionHeader
					badge="Blog"
					title="Tulisan Terbaru"
					description="Pemikiran, tutorial, dan wawasan seputar pengembangan web dan membangun produk."
				/>
				{postsResult.data.length > 0 ? (
					<div className="mx-auto mt-10">
						{postsResult.data.map((post) => (
							<PostItem key={post.id} post={post} />
						))}
					</div>
				) : (
					<p className="mt-12 text-center text-text-mute">Belum ada artikel yang ditampilkan.</p>
				)}
				<div className="mt-10 text-center">
					<ButtonLink href="/blog" size="lg" variant="outline">
						Lihat Semua Tulisan &rarr;
					</ButtonLink>
				</div>
			</Section>

			<Section>
				<div className="rounded-2xl border border-border bg-surface px-6 py-14 sm:px-12">
					<SectionHeader
						badge="Mari Bekerja Sama"
						title="Punya Project dalam Pikiran? Mari Bangun Sesuatu yang Hebat Bersama."
						description="Saya saat ini terbuka untuk project freelance maupun kesempatan penuh waktu. Mari diskusikan bagaimana mewujudkan ide Anda."
					/>
					<div className="mt-8 flex flex-wrap justify-center gap-3">
						<ButtonLink href="/contact" size="lg">
							Hubungi Saya &rarr;
						</ButtonLink>
						{emailHref ? (
							<ButtonLink
								href={emailHref}
								icon={<CiMail className="text-xl" aria-hidden="true" />}
								size="lg"
								variant="secondary"
							>
								Kirim Email
							</ButtonLink>
						) : null}
					</div>
				</div>
			</Section>
		</>
	);
}
