import type { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";

export function findUserByUsername(username: string): Promise<User | null> {
	return prisma.user.findUnique({
		where: { username },
	});
}

export function findUserById(id: string): Promise<User | null> {
	return prisma.user.findUnique({
		where: { id },
	});
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
	await prisma.user.update({
		data: { passwordHash },
		where: { id },
	});
}
