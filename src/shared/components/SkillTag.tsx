import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
	SiDocker,
	SiGit,
	SiGithub,
	SiJavascript,
	SiNextdotjs,
	SiNodedotjs,
	SiPostgresql,
	SiPrisma,
	SiReact,
	SiTailwindcss,
	SiTypescript,
} from "react-icons/si";

const skillIcons: Record<string, IconType> = {
	docker: SiDocker,
	git: SiGit,
	github: SiGithub,
	javascript: SiJavascript,
	nextdotjs: SiNextdotjs,
	nextjs: SiNextdotjs,
	nodedotjs: SiNodedotjs,
	nodejs: SiNodedotjs,
	postgresql: SiPostgresql,
	prisma: SiPrisma,
	react: SiReact,
	sitailwindcss: SiTailwindcss,
	sitypescript: SiTypescript,
	tailwindcss: SiTailwindcss,
	typescript: SiTypescript,
};

type SkillTagProps = {
	icon?: string | null;
	name: string;
};

function normalizeIconName(icon: string | null | undefined): string {
	return icon?.toLowerCase().replaceAll(/[^a-z0-9]/g, "") ?? "";
}

export function isSkillImageUrl(icon: string | null | undefined): icon is string {
	return Boolean(icon && /^https?:\/\//iu.test(icon));
}

export function getSkillIcon(icon: string | null | undefined): IconType | undefined {
	return skillIcons[normalizeIconName(icon)];
}

export function SkillTag({ icon, name }: SkillTagProps) {
	const Icon = getSkillIcon(icon);
	let iconContent: ReactNode = null;

	if (isSkillImageUrl(icon)) {
		iconContent = (
			// biome-ignore lint/performance/noImgElement: URL gambar dipilih dari galeri Media yang dikelola admin.
			<img src={icon} alt="" className="size-3.5 object-contain" />
		);
	} else if (Icon) {
		iconContent = <Icon className="text-accent" aria-hidden="true" />;
	}

	return (
		<span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs">
			{iconContent}
			{name}
		</span>
	);
}
