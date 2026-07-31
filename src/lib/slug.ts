type SlugOptions = {
	fallback?: string;
	maxLength?: number;
};

function truncate(value: string, maxLength: number): string {
	return value.slice(0, maxLength).replace(/-+$/u, "");
}

export function slugify(value: string, options: SlugOptions = {}): string {
	const fallback = options.fallback ?? "item";
	const maxLength = options.maxLength ?? 220;
	const normalized = value
		.normalize("NFKD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/gu, "-")
		.replace(/^-+|-+$/gu, "");

	return truncate(normalized || fallback, maxLength) || fallback;
}

export async function generateUniqueSlug(
	value: string,
	isAvailable: (slug: string) => Promise<boolean>,
	options: SlugOptions = {},
): Promise<string> {
	const maxLength = options.maxLength ?? 220;
	const base = slugify(value, options);
	if (await isAvailable(base)) {
		return base;
	}

	for (let suffix = 2; ; suffix += 1) {
		const suffixValue = `-${suffix}`;
		const candidate = `${truncate(base, maxLength - suffixValue.length)}${suffixValue}`;
		if (await isAvailable(candidate)) {
			return candidate;
		}
	}
}
