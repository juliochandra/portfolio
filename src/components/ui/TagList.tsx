import { SkillTag } from "@/components/ui/SkillTag";

type TagListProps = {
	className?: string;
	label: string;
	names: readonly string[];
};

export function TagList({ className, label, names }: TagListProps) {
	if (names.length === 0) {
		return null;
	}

	return (
		<ul className={`my-4 flex flex-wrap gap-1.5 ${className ?? ""}`} aria-label={label}>
			{names.map((name) => (
				<li key={name}>
					<SkillTag name={name} />
				</li>
			))}
		</ul>
	);
}
