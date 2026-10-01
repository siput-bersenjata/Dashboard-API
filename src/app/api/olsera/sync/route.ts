import { NextRequest, NextResponse } from "next/server";
import { syncOlseraTransactions } from "@/lib/olsera";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const result = await syncOlseraTransactions({
      startDate: todayStr,
      endDate: todayStr,
      maxPages: 5,
    });

    return NextResponse.json({
      status: "success",
      source: "auto_background_sync",
      date: todayStr,
      totalIngested: result.totalIngested,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Gagal auto-sync Olsera:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal sinkronisasi data dari Olsera" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const todayStr = new Date().toISOString().split("T")[0];
    const { startDate = todayStr, endDate = todayStr, maxPages } = body;

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
    console.error("Gagal sinkronisasi Olsera:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal sinkronisasi data dari Olsera" },
      { status: 500 }
    );
  }
}
