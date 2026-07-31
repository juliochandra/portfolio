export function isImageUrl(value: string | null | undefined): value is string {
	return Boolean(value && /^https?:\/\//iu.test(value));
}
