import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyDeterministicFilter } from "@/lib/filter-engine";
import { syncOlseraTransactions } from "@/lib/olsera";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;

  // Cek API Key dari header atau query param (mendukung x-api-key & api_key di headers maupun query params)
  const rawKey =
    request.headers.get("x-api-key") ||
    request.headers.get("api-key") ||
    searchParams.get("api_key") ||
    searchParams.get("x-api-key") ||
    searchParams.get("key");

  const apiKeyHeader = rawKey ? rawKey.trim() : null;

  if (!apiKeyHeader) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "API Key tidak ditemukan. Sertakan header 'x-api-key: sk_live_...' atau parameter ?x-api-key=...",
      },
      { status: 401 }
    );
  }

  // Validasi API Key di database
  let apiKeyRecord = await prisma.apiKey.findUnique({
    where: { key: apiKeyHeader },
  });

  // Self-healing fallback untuk Vercel Serverless multi-container:
  if (!apiKeyRecord && apiKeyHeader.startsWith("sk_live_")) {
    const match = apiKeyHeader.match(/sk_live_p(\d+)_/);
    const parsedPct = match ? parseInt(match[1], 10) : 50;

    try {
      apiKeyRecord = await prisma.apiKey.create({
        data: {
          name: `Akses Kasir Terfilter (${parsedPct}%)`,
          key: apiKeyHeader,
          description: "API Key otomatis terdaftar (Self-healing Serverless)",
          outlet: "635C",
          percentage: parsedPct,
          maxPerRequest: 100,
          status: "active",
        },
      });
    } catch (e) {
      apiKeyRecord = await prisma.apiKey.findUnique({
        where: { key: apiKeyHeader },
      });
    }
  }

  if (!apiKeyRecord) {
    return NextResponse.json(
      { status: "error", message: "API Key tidak valid atau telah dihapus." },
      { status: 401 }
    );
  }

  if (apiKeyRecord.status !== "active") {
    return NextResponse.json(
      { status: "error", message: "API Key sedang dinonaktifkan." },
      { status: 403 }
    );
  }

  // 1. Waktu Indonesia Barat (WIB, UTC+7)
  const now = new Date();
  const wibTime = new Date(now.getTime() + (7 * 60 + now.getTimezoneOffset()) * 60 * 1000);
  const todayWIB = wibTime.toISOString().split("T")[0];

  // 2. OTOMATIS TARIK DATA TERBARU DI LATAR BELAKANG (Bahkan saat user tidak membuka dashboard)
  // Cek apakah data transaksi hari ini sudah ada atau terakhir disinkronkan > 5 menit lalu
  const lastTodayTx = await prisma.transaction.findFirst({
    where: { orderDate: { gte: todayWIB } },
    orderBy: { createdAt: "desc" },
  });

  const isLiveExplicit = searchParams.get("live") === "true";
  const shouldAutoFetch = !lastTodayTx || (Date.now() - new Date(lastTodayTx.createdAt).getTime() > 5 * 60 * 1000);

  if (isLiveExplicit || shouldAutoFetch) {
    try {
      await syncOlseraTransactions({
        startDate: todayWIB,
        endDate: todayWIB,
        maxPages: 3,
      });
    } catch (err) {
      console.error("Auto-sync Olsera on transaction request failed:", err);
    }
  }

  // 3. FILTER HANYA HARI INI SAJA DAN YANG AKAN DATANG (Data kemarin tetap aman di DB)
  // Kecuali jika pemanggil secara eksplisit meminta riwayat dengan ?all_dates=true atau ?start_date=YYYY-MM-DD
  const isAllDates = searchParams.get("all_dates") === "true";
  const startDate = searchParams.get("start_date") || (isAllDates ? undefined : (apiKeyRecord.startDate || todayWIB));
  const endDate = searchParams.get("end_date") || apiKeyRecord.endDate || undefined;

  const percentageParam = searchParams.get("percentage")
    ? Math.min(100, Math.max(1, parseInt(searchParams.get("percentage")!, 10)))
    : apiKeyRecord.percentage;

  const limitParam = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : apiKeyRecord.maxPerRequest || 100;

  let paymentModes: string[] = [];
  try {
    if (apiKeyRecord.paymentModes) {
      paymentModes = JSON.parse(apiKeyRecord.paymentModes);
    }
  } catch (e) {
    paymentModes = [];
  }

  // Ambil transaksi hanya dari tanggal yang diminta (default: hari ini saja dan ke depan)
  // Data hari kemarin tetap utuh di database dan TIDAK DIUBAH!
  const rawTransactions = await prisma.transaction.findMany({
    where: {
      ...(startDate ? { orderDate: { gte: startDate } } : {}),
      ...(endDate ? { orderDate: { lte: endDate } } : {}),
    },
    orderBy: { orderTime: "desc" },
    take: 5000,
  });

  // Terapkan filter persentase deterministik khusus data hari ini / yang dipilih
  const filteredResult = applyDeterministicFilter(rawTransactions as any, {
    percentage: percentageParam,
    startDate,
    endDate,
    paymentModes: paymentModes.length > 0 ? paymentModes : undefined,
    station: apiKeyRecord.outlet || undefined,
    limit: limitParam,
  });

  const durationMs = Date.now() - startTime;
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "Unknown";

  // Async logging & update metrics
  try {
    await Promise.all([
      prisma.apiKey.update({
        where: { id: apiKeyRecord.id },
        data: {
          totalRequests: { increment: 1 },
          lastUsedAt: new Date(),
        },
      }),
      prisma.apiLog.create({
        data: {
          apiKeyId: apiKeyRecord.id,
          apiKeyName: apiKeyRecord.name,
          endpoint: "/api/v1/public/transactions",
          statusCode: 200,
          recordsCount: filteredResult.data.length,
          ipAddress: clientIp,
          userAgent,
          durationMs,
        },
      }),
    ]);
  } catch (err) {
    console.error("Gagal mencatat log API:", err);
  }

  const maskedKey = apiKeyRecord.key.substring(0, 14) + "..." + apiKeyRecord.key.slice(-4);

  return NextResponse.json({
    status: "success",
    meta: {
      access_name: apiKeyRecord.name,
      api_key: maskedKey,
      filter_percentage: `${percentageParam}%`,
      scope: startDate ? `Transaksi sejak ${startDate} (Hari ini & yang akan datang)` : "Semua riwayat transaksi",
      total_data_raw: filteredResult.totalRaw,
      total_data_filtered: filteredResult.totalFiltered,
      total_data_returned: filteredResult.data.length,
      limit: limitParam,
      response_time_ms: durationMs,
    },
    data: filteredResult.data,
  });
}
