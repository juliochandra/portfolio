import bcrypt from "bcrypt";

const BCRYPT_SALT_ROUNDS = 10;

export type SeedPrismaClient = {
  user: {
    count: () => Promise<number>;
    create: (args: {
      data: { username: string; passwordHash: string };
    }) => Promise<unknown>;
  };
};

export async function seedAdminUser(
  prisma: SeedPrismaClient,
  credentials: { username: string; password: string },
): Promise<"created" | "skipped"> {
  const existing = await prisma.user.count();
  if (existing > 0) {
    return "skipped";
  }

  const passwordHash = await bcrypt.hash(credentials.password, BCRYPT_SALT_ROUNDS);
  await prisma.user.create({
    data: { username: credentials.username, passwordHash },
  });
  return "created";
}
