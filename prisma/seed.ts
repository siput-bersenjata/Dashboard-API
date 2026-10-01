import { PrismaClient } from "@prisma/client";
import { syncOlseraTransactions } from "../src/lib/olsera";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai sinkronisasi data transaksi awal dari Olsera...");
  try {
    const syncRes = await syncOlseraTransactions({
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      maxPages: 3, // Ingest first 300 transactions for fast initial setup
    });
    console.log("Hasil Sync:", syncRes);
  } catch (err: any) {
    console.warn("Sync Olsera warning (lanjutkan seeding):", err.message);
  }

  // Cek apakah API Keys sudah ada
  const existingKeys = await prisma.apiKey.count();
  if (existingKeys === 0) {
    console.log("Membuat default API Keys...");
    await prisma.apiKey.createMany({
      data: [
        {
          name: "Kasir Utama",
          key: "sk_live_7f8a" + Math.random().toString(36).substring(2, 10) + "3b7c",
          description: "Akses data utama POS Outlet Naiki Cafe",
          outlet: "635C",
          percentage: 100,
          startDate: "2026-09-01",
          endDate: "2026-09-30",
          paymentModes: JSON.stringify(["Qris BCA", "Cash", "ShopeePay"]),
          maxPerRequest: 100,
          status: "active",
          totalRequests: 1248,
        },
        {
          name: "Kasir 2 (Filter 70%)",
          key: "sk_live_9a2b" + Math.random().toString(36).substring(2, 10) + "6e7c",
          description: "Akses penarikan data terfilter kuota 70%",
          outlet: "635C",
          percentage: 70,
          startDate: "2026-09-01",
          endDate: "2026-09-30",
          paymentModes: JSON.stringify(["Qris BCA", "Cash"]),
          maxPerRequest: 100,
          status: "active",
          totalRequests: 840,
        },
        {
          name: "Kasir 3 (Filter 50%)",
          key: "sk_live_4c1e" + Math.random().toString(36).substring(2, 10) + "8p2m",
          description: "Akses publik sampel 50% transaksi kasir",
          outlet: "635C",
          percentage: 50,
          startDate: "2026-09-01",
          endDate: "2026-09-30",
          paymentModes: JSON.stringify(["Qris BCA"]),
          maxPerRequest: 50,
          status: "active",
          totalRequests: 394,
        },
      ],
    });
  }

  // Seed sample monitoring logs jika kosong
  const logsCount = await prisma.apiLog.count();
  if (logsCount === 0) {
    const keys = await prisma.apiKey.findMany();
    const modes = ["Qris BCA", "Cash", "ShopeePay"];
    const logs = [];
    const now = Date.now();

    for (let i = 0; i < 20; i++) {
      const selectedKey = keys[i % keys.length];
      const timeOffset = (20 - i) * 15 * 60 * 1000;
      logs.push({
        apiKeyId: selectedKey?.id,
        apiKeyName: selectedKey?.name || "Kasir Utama",
        endpoint: "/api/v1/public/transactions",
        statusCode: i === 18 ? 429 : 200,
        recordsCount: Math.floor(Math.random() * 50) + 10,
        ipAddress: `180.252.16.${10 + i}`,
        userAgent: "PostmanRuntime/7.39.0",
        durationMs: Math.floor(Math.random() * 80) + 40,
        createdAt: new Date(now - timeOffset),
      });
    }

    await prisma.apiLog.createMany({ data: logs });
  }

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
