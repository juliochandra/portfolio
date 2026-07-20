import type { IconType } from "react-icons";
import { CiAt, CiLink } from "react-icons/ci";
import { FaLinkedin } from "react-icons/fa";
import { SiGithub, SiX } from "react-icons/si";

type ContactLinkProps = {
	icon: string | null;
	label: string;
	value: string;
};

const contactIcons: Record<string, IconType> = {
	github: SiGithub,
	linkedin: FaLinkedin,
	sigithub: SiGithub,
	silinkedin: FaLinkedin,
	simail: CiAt,
	six: SiX,
	x: SiX,
};

function normalizeIconName(icon: string | null): string {
	return icon?.toLowerCase().replaceAll(/[^a-z0-9]/g, "") ?? "";
}

function getContactHref(value: string): string {
	if (value.startsWith("mailto:") || value.startsWith("http://") || value.startsWith("https://")) {
		return value;
	}

	return value.includes("@") ? `mailto:${value}` : value;
}

export function ContactLink({ icon, label, value }: ContactLinkProps) {
	const Icon = contactIcons[normalizeIconName(icon)] ?? CiLink;
	const isExternalLink = value.startsWith("http");

	return (
		<a
			href={getContactHref(value)}
			className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-surface"
			target={isExternalLink ? "_blank" : undefined}
			rel={isExternalLink ? "noreferrer" : undefined}
		>
			<Icon className="text-accent text-lg" aria-hidden="true" />
			<span className="font-semibold">{label}</span>
		</a>
	);
}
