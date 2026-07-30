import Link from "next/link";
import { CiMail, CiSquareChevUp } from "react-icons/ci";
import { ContactIconLink } from "@/shared/components/ContactLink";

const navigation = [
	["Home", "/"],
	["About", "/about"],
	["Portfolio", "/portfolio"],
	["Blog", "/blog"],
	["Contact", "/contact"],
] as const;
const resources = [
	["Projects", "/portfolio"],
	["Articles", "/blog"],
	["Resume", "/resume"],
	["Tech Stack", "/about"],
] as const;
type FooterContactInfo = {
	icon: string | null;
	id: string;
	label: string;
	value: string;
};

type FooterProps = {
	contactInfo?: FooterContactInfo[];
};

export function Footer({ contactInfo = [] }: FooterProps) {
	return (
		<footer className="border-border border-t bg-canvas px-6 py-14 lg:px-16">
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-12 md:grid-cols-2 xl:grid-cols-[1.35fr_0.9fr_0.9fr_1.1fr]">
					<div>
						<p className="font-bold text-3xl tracking-[-0.08em]">JULIO.</p>
						<p className="mt-6 max-w-85 text-text-mute leading-8">
							Full-stack developer who builds modern, fast, and scalable web applications.
						</p>
						{contactInfo.length > 0 ? (
							<div className="mt-8 flex flex-wrap items-center gap-2 text-text-mute">
								{contactInfo.map((contact) => (
									<ContactIconLink key={contact.id} {...contact} />
								))}
							</div>
						) : null}
					</div>
					<FooterLinks title="Navigation" links={navigation} />
					<FooterLinks title="Resources" links={resources} />
					<div>
						<h2 className="font-bold text-lg">Let's Connect</h2>
						<p className="mt-6 max-w-85 text-text-mute leading-8">
							I’m currently available for freelance projects and full-time opportunities.
						</p>
						<a
							href="mailto:hello@example.com"
							className="mt-7 inline-flex items-center gap-3 rounded-lg border border-border px-5 py-3 font-medium hover:bg-surface"
						>
							<CiMail className="text-2xl" />
							Send me an email
						</a>
					</div>
				</div>
				<div className="mt-12 flex flex-col gap-4 border-border border-t pt-7 text-sm text-text-mute sm:flex-row sm:items-center sm:justify-between">
					<p>© {new Date().getFullYear()} Julio. All rights reserved.</p>
					<a href="#top" className="inline-flex items-center gap-2 hover:text-text">
						<CiSquareChevUp className="text-xl" />
						Back to top
					</a>
				</div>
			</div>
		</footer>
	);
}
function FooterLinks({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
	return (
		<div>
			<h2 className="font-bold text-lg">{title}</h2>
			<ul className="mt-6 space-y-4 text-text-mute">
				{links.map(([label, href]) => (
					<li key={href}>
						<Link href={href} className="hover:text-text">
							{label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
