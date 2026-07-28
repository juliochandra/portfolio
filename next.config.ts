import { resolve } from "node:path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

type WebpackExternalRequest = {
	request?: string;
};

type WebpackExternalCallback = (error?: Error | null, result?: string) => void;

const PRISMA_QUERY_COMPILER_REQUEST = "query_compiler_fast_bg.wasm?module";
const PRISMA_QUERY_COMPILER_PATH = resolve(process.cwd(), `src/generated/prisma/internal/${PRISMA_QUERY_COMPILER_REQUEST}`);

if (process.env.NODE_ENV === "development") {
	initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
	distDir: process.env.NEXT_DIST_DIR ?? ".next",
	experimental: {
		serverActions: {
			bodySizeLimit: "3mb",
		},
	},
	webpack(config) {
		const existingExternals = Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean);

		config.externals = [
			...existingExternals,
			({ request }: WebpackExternalRequest, callback: WebpackExternalCallback) => {
				if (request?.endsWith(PRISMA_QUERY_COMPILER_REQUEST)) {
					callback(null, `module ${PRISMA_QUERY_COMPILER_PATH}`);
					return;
				}

				callback();
			},
		];

		return config;
	},
};

export default nextConfig;
