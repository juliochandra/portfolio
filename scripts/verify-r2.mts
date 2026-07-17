/** biome-ignore-all lint/suspicious/noConsole: <console> */
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../src/shared/env.ts";

const key = "verify-r2/smoke-test.txt";
const body = `portfolio R2 smoke test — ${new Date().toISOString()}`;

const client = new S3Client({
	region: "auto",
	endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
	},
});

async function upload(): Promise<void> {
	await client.send(
		new PutObjectCommand({
			Bucket: env.R2_BUCKET_NAME,
			Key: key,
			Body: body,
			ContentType: "text/plain",
		}),
	);

	const result = await client.send(new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }));
	const readBack = await result.Body?.transformToString();
	if (readBack !== body) {
		throw new Error("Readback mismatch — upload verification failed");
	}

	console.log("Upload + readback via S3 SDK: OK");
	console.log(`Public URL (buka manual di peramban): ${env.R2_PUBLIC_URL}/${key}`);
}

async function cleanup(): Promise<void> {
	await client.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }));
	console.log("Test object dihapus dari bucket.");
}

const action = process.argv[2];
if (action === "cleanup") {
	await cleanup();
} else {
	await upload();
}
