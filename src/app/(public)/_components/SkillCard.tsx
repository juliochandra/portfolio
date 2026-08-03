import type { ReactNode } from "react";
import { getSkillIcon } from "@/components/ui/SkillTag";
import type { PublicSkill } from "@/features/skills/skills.type";
import { isImageUrl } from "@/lib/validation/is-image-url";

export function SkillCard({ skill }: { skill: PublicSkill }) {
	const Icon = getSkillIcon(skill.icon);
	let iconContent: ReactNode;

	if (isImageUrl(skill.icon)) {
		iconContent = (
			// biome-ignore lint/performance/noImgElement: URL gambar dipilih dari galeri Media yang dikelola admin.
			<img src={skill.icon} alt="" className="size-12 object-contain" />
		);
	} else if (Icon) {
		iconContent = <Icon className="text-3xl text-accent" aria-hidden="true" />;
	} else {
		iconContent = <span className="font-mono text-2xl text-accent">&lt;/&gt;</span>;
	}

	return (
		<li className="grid place-items-center rounded-xl border border-border bg-canvas px-4 py-5 text-center">
			{iconContent}
			<span className="mt-4 font-semibold">{skill.name}</span>
		</li>
	);
}
