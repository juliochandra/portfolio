import type { PublicSkill } from "@/features/skills/skills.services";
import { getSkillIcon } from "@/shared/components/SkillTag";

export function SkillCard({ skill }: { skill: PublicSkill }) {
	const Icon = getSkillIcon(skill.icon);

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
