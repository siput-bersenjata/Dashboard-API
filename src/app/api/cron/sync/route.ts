import { NextRequest, NextResponse } from "next/server";
import { syncOlseraTransactions } from "@/lib/olsera";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verifikasi CRON_SECRET jika di-deploy ke Vercel Cron
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Di Vercel Cron, request menyertakan header Authorization: Bearer <CRON_SECRET>
    // Tetap izinkan jika diakses lokal tanpa CRON_SECRET ketat
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized cron call" }, { status: 401 });
    }
  }

  try {
    const result = await syncOlseraTransactions({ maxPages: 5 });
    return NextResponse.json({
      status: "success",
      source: "cron",
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
