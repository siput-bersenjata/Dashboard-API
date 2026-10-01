import { NextRequest, NextResponse } from "next/server";
import { syncOlseraTransactions } from "@/lib/olsera";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { startDate, endDate, maxPages } = body;

    const result = await syncOlseraTransactions({
      startDate,
      endDate,
      maxPages: maxPages ? Number(maxPages) : 5,
    });

    return NextResponse.json({
      status: "success",
      message: result.message,
      totalIngested: result.totalIngested,
    });
  } catch (error: any) {
    console.error("Gagal sinkronisasi manual Olsera:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal sinkronisasi data dari Olsera" },
      { status: 500 }
    );
  }
}
