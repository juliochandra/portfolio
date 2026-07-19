type TagListProps = {
	className?: string;
	label: string;
	names: readonly string[];
};

export function TagList({ label, names }: TagListProps) {
	if (names.length === 0) {
		return null;
	}

	return (
		<ul className="my-4 flex flex-wrap gap-1.5" aria-label={label}>
			{names.map((name) => (
				<li key={name} className="rounded-md border border-border bg-surface px-2 py-1 text-xs">
					{name}
				</li>
			))}
		</ul>
	);
}
