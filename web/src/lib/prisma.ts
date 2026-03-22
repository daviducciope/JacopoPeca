import "server-only";

import { PrismaClient } from "@prisma/client";

declare global {
  var __jacopoPrisma: PrismaClient | undefined;
}

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

export const prisma = isDatabaseConfigured
  ? globalThis.__jacopoPrisma ?? new PrismaClient()
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