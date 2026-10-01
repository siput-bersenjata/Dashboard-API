import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyDeterministicFilter } from "@/lib/filter-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;

  // Cek API Key dari header atau query param
  const apiKeyHeader =
    request.headers.get("x-api-key") || searchParams.get("api_key");

  if (!apiKeyHeader) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "API Key tidak ditemukan. Sertakan header 'x-api-key: sk_live_...' atau parameter ?api_key=...",
      },
      { status: 401 }
    );
  }

  // Validasi API Key di database
  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { key: apiKeyHeader },
  });

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

  // Parse filter options dari konfigurasi API Key atau query params override
  const startDate = searchParams.get("start_date") || apiKeyRecord.startDate || undefined;
  const endDate = searchParams.get("end_date") || apiKeyRecord.endDate || undefined;
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

  // Ambil transaksi dari database
  const rawTransactions = await prisma.transaction.findMany({
    orderBy: { orderTime: "desc" },
    take: 5000,
  });

  // Terapkan filter persentase deterministik & kriteria
  const filteredResult = applyDeterministicFilter(rawTransactions as any, {
    percentage: apiKeyRecord.percentage,
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

  const maskedKey = apiKeyRecord.key.substring(0, 10) + "..." + apiKeyRecord.key.slice(-4);

  return NextResponse.json({
    status: "success",
    meta: {
      access_name: apiKeyRecord.name,
      api_key: maskedKey,
      filter_percentage: `${apiKeyRecord.percentage}%`,
      total_data_raw: filteredResult.totalRaw,
      total_data_filtered: filteredResult.totalFiltered,
      total_data_returned: filteredResult.data.length,
      limit: limitParam,
      response_time_ms: durationMs,
    },
    data: filteredResult.data,
  });
}
