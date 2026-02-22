import { prisma } from "@/lib/prisma";

export async function ensureAuthTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS auth_credentials (
      user_id UUID PRIMARY KEY,
      password_hash TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function setUserPasswordHash(userId: string, passwordHash: string) {
  await ensureAuthTable();
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO auth_credentials (user_id, password_hash, updated_at)
      VALUES ($1::uuid, $2, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW();
    `,
    userId,
    passwordHash,
  );
}

export async function getUserPasswordHash(userId: string) {
  await ensureAuthTable();
  const result = await prisma.$queryRawUnsafe<Array<{ password_hash: string }>>(
    `SELECT password_hash FROM auth_credentials WHERE user_id = $1::uuid LIMIT 1;`,
    userId,
  );
  return result[0]?.password_hash ?? null;
}
