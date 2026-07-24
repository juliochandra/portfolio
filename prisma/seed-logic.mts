import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = 10;

export type AdminSeedData = {
	passwordHash: string;
	username: string;
};

export async function createAdminSeedData(credentials: { username: string; password: string }): Promise<AdminSeedData> {
	return {
		username: credentials.username,
		passwordHash: await bcrypt.hash(credentials.password, BCRYPT_SALT_ROUNDS),
	};
}
