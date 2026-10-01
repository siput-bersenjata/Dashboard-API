import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Setup SQLite path untuk Vercel Serverless agar bisa write di /tmp
if (process.env.VERCEL && (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:"))) {
  const tmpDbPath = path.join("/tmp", "dev.db");
  if (!fs.existsSync(tmpDbPath)) {
    const candidates = [
      path.join(process.cwd(), "dev.db"),
      path.join(process.cwd(), "prisma", "dev.db"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        try {
          fs.copyFileSync(c, tmpDbPath);
          break;
        } catch (e) {
          console.error("Gagal copy dev.db ke /tmp:", e);
        }
      }
    }
  }
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
