import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export function comparePassword(password: string, passwordHash: string): Promise<boolean> {
	return bcrypt.compare(password, passwordHash);
}
