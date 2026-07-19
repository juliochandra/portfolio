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
import type { PublicSkill } from "@/features/skills/skills.services";

const icons: Record<string, IconType> = {
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

function normalizeIcon(icon: string | null): string {
	return icon?.toLowerCase().replaceAll(/[^a-z0-9]/g, "") ?? "";
}

export function SkillCard({ skill }: { skill: PublicSkill }) {
	const Icon = icons[normalizeIcon(skill.icon)];

	return (
		<li className="grid place-items-center rounded-xl border border-border bg-canvas px-4 py-5 text-center">
			{Icon ? (
				<Icon className="text-3xl text-accent" aria-hidden="true" />
			) : (
				<span className="font-mono text-2xl text-accent">&lt;/&gt;</span>
			)}
			<span className="mt-4 font-semibold">{skill.name}</span>
		</li>
	);
}
