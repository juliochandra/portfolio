import { prisma } from "@/shared/database/prisma";

export type AuthUser = {
	id: string;
	passwordHash: string;
	username: string;
};

const authUserSelect = {
	id: true,
	passwordHash: true,
	username: true,
} as const;

export function findUserByUsername(username: string): Promise<AuthUser | null> {
	return prisma.user.findUnique({
		select: authUserSelect,
		where: { username },
	});
}

export function findUserById(id: string): Promise<AuthUser | null> {
	return prisma.user.findUnique({
		select: authUserSelect,
		where: { id },
	});
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
	await prisma.user.update({
		data: { passwordHash },
		where: { id },
	});
}
