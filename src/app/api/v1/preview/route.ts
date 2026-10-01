import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyDeterministicFilter } from "@/lib/filter-engine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKeyId, percentage, startDate, endDate, paymentModes, station, limit } = body;

    let targetPercentage = percentage !== undefined ? Number(percentage) : 100;
    let targetStartDate = startDate;
    let targetEndDate = endDate;
    let targetPaymentModes = paymentModes || [];
    let targetStation = station;
    let targetLimit = limit ? Number(limit) : 50;
    let apiKeyName = "Custom Filter";
    let apiKeyValue = "sk_live_sample_key";

    // Jika user memilih berdasarkan API Key tertentu
    if (apiKeyId) {
      const keyObj = await prisma.apiKey.findUnique({ where: { id: apiKeyId } });
      if (keyObj) {
        apiKeyName = keyObj.name;
        apiKeyValue = keyObj.key;
        if (percentage === undefined) targetPercentage = keyObj.percentage;
        if (!targetStartDate) targetStartDate = keyObj.startDate || undefined;
        if (!targetEndDate) targetEndDate = keyObj.endDate || undefined;
        if (targetPaymentModes.length === 0 && keyObj.paymentModes) {
          try {
            targetPaymentModes = JSON.parse(keyObj.paymentModes);
          } catch (e) {}
        }
        if (!targetStation) targetStation = keyObj.outlet || undefined;
        if (!limit) targetLimit = keyObj.maxPerRequest;
      }
    }

    // Ambil data transaksi dari database
    const allTransactions = await prisma.transaction.findMany({
      orderBy: { orderTime: "desc" },
    });

    const filteredResult = applyDeterministicFilter(allTransactions as any, {
      percentage: targetPercentage,
      startDate: targetStartDate,
      endDate: targetEndDate,
      paymentModes: targetPaymentModes.length > 0 ? targetPaymentModes : undefined,
      station: targetStation,
      limit: targetLimit,
    });

    // Hitung agregasi data terfilter
    const totalGross = filteredResult.data.reduce((acc, curr) => acc + curr.subtotal, 0);
    const totalTax = filteredResult.data.reduce((acc, curr) => acc + curr.tax, 0);
    const totalPaid = filteredResult.data.reduce((acc, curr) => acc + curr.paidAmount, 0);

    // Hitung distribusi metode pembayaran
    const paymentModeCounts: Record<string, number> = {};
    for (const item of filteredResult.data) {
      const mode = item.paymentModeName || "Lainnya";
      paymentModeCounts[mode] = (paymentModeCounts[mode] || 0) + 1;
    }

    return NextResponse.json({
      status: "success",
      filterConfig: {
        apiKeyName,
        apiKey: apiKeyValue,
        percentage: targetPercentage,
        startDate: targetStartDate || "Semua",
        endDate: targetEndDate || "Semua",
        paymentModes: targetPaymentModes,
        station: targetStation || "Semua Kasir",
        limit: targetLimit,
      },
      stats: {
        totalRaw: filteredResult.totalRaw,
        totalFiltered: filteredResult.totalFiltered,
        totalReturned: filteredResult.data.length,
        totalGross,
        totalTax,
        totalPaid,
        paymentDistribution: paymentModeCounts,
      },
      data: filteredResult.data,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
