import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [], // Request handlers expose sanitized errors; never log proof or credential arguments.,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
