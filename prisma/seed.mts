import "dotenv/config";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { z } from "zod";
import { createAdminSeedData } from "./seed-logic.mts";

const executeFile = promisify(execFile);

const seedEnv = z
	.object({
		ADMIN_PASSWORD: z.string().min(8),
		ADMIN_USERNAME: z.string().min(1),
		D1_DATABASE_NAME: z.string().min(1).default("portfolio"),
	})
	.parse(process.env);

function escapeSqlValue(value: string): string {
	return value.replaceAll("'", "''");
}

function getD1Target(): "--local" | "--remote" {
	return process.argv.includes("--local") ? "--local" : "--remote";
}

function createSeedCommand(data: { passwordHash: string; username: string }): string {
	const id = randomUUID();
	const username = escapeSqlValue(data.username);
	const passwordHash = escapeSqlValue(data.passwordHash);

	// biome-ignore lint/nursery/noSecrets: SQL identifiers are not secrets.
	const insertUserStatement = 'INSERT INTO "User" ("id", "username", "passwordHash")';

	return [
		insertUserStatement,
		`SELECT '${id}', '${username}', '${passwordHash}'`,
		'WHERE NOT EXISTS (SELECT 1 FROM "User");',
	].join(" ");
}

async function main(): Promise<void> {
	const data = await createAdminSeedData({
		username: seedEnv.ADMIN_USERNAME,
		password: seedEnv.ADMIN_PASSWORD,
	});
	const wranglerCliPath = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url));
	const target = getD1Target();
	const { stderr, stdout } = await executeFile(
		process.execPath,
		[wranglerCliPath, "d1", "execute", seedEnv.D1_DATABASE_NAME, target, `--command=${createSeedCommand(data)}`],
		{ cwd: process.cwd() },
	);

	process.stdout.write(stdout);
	if (stderr) {
		process.stderr.write(stderr);
	}
	console.log(`Seed admin selesai untuk: ${seedEnv.ADMIN_USERNAME}`);
}

main().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
