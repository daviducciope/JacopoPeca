import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var __jacopoPrisma: PrismaClient | undefined;
}

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const requiresSsl = process.env.DATABASE_URL.includes("sslmode=require")
    || process.env.DATABASE_URL.includes("rds.amazonaws.com");
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ...(requiresSsl
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {}),
  });

  return new PrismaClient({ adapter });
}

export const prisma = isDatabaseConfigured
  ? globalThis.__jacopoPrisma ?? createPrismaClient()
  : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalThis.__jacopoPrisma = prisma;
}

export function requirePrisma() {
  if (!prisma) {
    throw new Error("DATABASE_URL non configurato.");
  }

  return prisma;
}
