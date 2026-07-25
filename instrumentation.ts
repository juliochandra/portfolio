export async function register(): Promise<void> {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		const { getCloudflareContext } = await import("@opennextjs/cloudflare");
		await getCloudflareContext({ async: true });
	}
}
