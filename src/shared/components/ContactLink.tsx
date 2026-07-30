import type { IconType } from "react-icons";
import { CiAt, CiLink } from "react-icons/ci";
import { FaLinkedin } from "react-icons/fa";
import { SiGithub, SiX } from "react-icons/si";
import { isImageUrl } from "@/shared/validation/is-image-url";

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

function ContactIcon({ icon, className }: Pick<ContactLinkProps, "icon"> & { className?: string }) {
	const Icon = contactIcons[normalizeIconName(icon)] ?? CiLink;

	if (isImageUrl(icon)) {
		return (
			// biome-ignore lint/performance/noImgElement: URL gambar dipilih admin dari galeri Media.
			<img src={icon} alt="" className={className ?? "size-5 object-contain"} />
		);
	}

	return <Icon className={className ?? "text-accent text-lg"} aria-hidden="true" />;
}

export function ContactLink({ icon, label, value }: ContactLinkProps) {
	const isExternalLink = value.startsWith("http");

	return (
		<a
			href={getContactHref(value)}
			className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-surface"
			target={isExternalLink ? "_blank" : undefined}
			rel={isExternalLink ? "noreferrer" : undefined}
		>
			<ContactIcon icon={icon} />
			<span className="font-semibold capitalize">{label}</span>
		</a>
	);
}

export function ContactIconLink({ icon, label, value }: ContactLinkProps) {
	const isExternalLink = value.startsWith("http");

	return (
		<a
			href={getContactHref(value)}
			aria-label={label}
			className="transition-colors hover:text-accent"
			target={isExternalLink ? "_blank" : undefined}
			rel={isExternalLink ? "noreferrer" : undefined}
		>
			<ContactIcon icon={icon} className="size-8" />
		</a>
	);
}
