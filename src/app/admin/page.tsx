import Link from "next/link";
import { FaBriefcase, FaCode, FaFileLines, FaImage, FaInbox, FaLink, FaTag } from "react-icons/fa6";
import { QuickAction } from "@/components/admin/QuickAction";
import { SummaryRow } from "@/components/admin/SummaryRow";
import { StatCard } from "@/components/ui/StatCard";
import { getDashboardSummary } from "@/features/dashboard/dashboard.action";

export default async function AdminPage() {
	const result = await getDashboardSummary();
	if ("error" in result) {
		return null;
	}

	const { data } = result;

	return (
		<div className="space-y-8">
			<section aria-label="Ringkasan Statistik" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
				<StatCard
					icon={FaFileLines}
					label="Total Posts"
					value={String(data.totalPosts)}
					description={`Published: ${data.publishedPosts}`}
				/>
				<StatCard
					icon={FaBriefcase}
					label="Total Projects"
					value={String(data.totalProjects)}
					description={`Published: ${data.publishedProjects}`}
				/>
				<StatCard icon={FaTag} label="Total Tags" value={String(data.totalTags)} description="Available tags" />
				<StatCard icon={FaCode} label="Total Skills" value={String(data.totalSkills)} description="Available skills" />
			</section>

			<section className="grid gap-6 2xl:grid-cols-2">
				<div className="rounded-xl border border-border bg-canvas p-5 sm:p-6">
					<div className="flex items-center justify-between gap-4">
						<h2 className="font-bold text-xl">Recent Posts</h2>
						<Link href="/admin/posts" className="font-semibold text-accent text-sm hover:underline">
							View all
						</Link>
					</div>
					<div className="mt-3">
						{data.recentPosts.map((post) => (
							<SummaryRow
								key={post.id}
								createdAt={post.createdAt}
								href={`/admin/posts/${post.id}`}
								labels={post.tags.map((tag) => tag.name)}
								status={post.status}
								thumbnailImage={post.thumbnailImage}
								title={post.title}
							/>
						))}
					</div>
				</div>

				<div className="rounded-xl border border-border bg-canvas p-5 sm:p-6">
					<div className="flex items-center justify-between gap-4">
						<h2 className="font-bold text-xl">Recent Projects</h2>
						<Link href="/admin/projects" className="font-semibold text-accent text-sm hover:underline">
							View all
						</Link>
					</div>
					<div className="mt-3">
						{data.recentProjects.map((project) => (
							<SummaryRow
								key={project.id}
								createdAt={project.createdAt}
								href={`/admin/projects/${project.id}`}
								labels={project.skills.map((skill) => skill.name)}
								status={project.status}
								thumbnailImage={project.thumbnailImage}
								title={project.title}
							/>
						))}
					</div>
				</div>
			</section>

			<section className="rounded-xl border border-border bg-canvas p-5 sm:p-6">
				<h2 className="font-bold text-xl">Quick Actions</h2>
				<div className="mt-5 flex flex-wrap gap-3">
					<QuickAction icon={FaFileLines} label="New Post" description="Create a new blog post" href="/admin/posts/new" />
					<QuickAction icon={FaBriefcase} label="New Project" description="Add a new project" href="/admin/projects/new" />
					<QuickAction icon={FaCode} label="New Skill" description="Add a new skill" href="/admin/skills" />
					<QuickAction icon={FaImage} label="Upload Media" description="Upload file or image" href="/admin/media" />
					<QuickAction icon={FaInbox} label="View Messages" description="Check new messages" href="/admin/messages" />
					<QuickAction icon={FaLink} label="Contact Info" description="Manage contact details" href="/admin/contact" />
				</div>
			</section>
		</div>
	);
}
