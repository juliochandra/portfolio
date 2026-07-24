import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
	distDir: process.env.NEXT_DIST_DIR ?? ".next",
	serverExternalPackages: ["@prisma/client", ".prisma/client"],
	experimental: {
		serverActions: {
			bodySizeLimit: "3mb",
		},
	},
};

export default nextConfig;
