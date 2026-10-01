import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OLSERA_BASE_URL = "https://api-dash.olsera.co.id/";
const CLIENT_ID = 2;
const CLIENT_SECRET = "0XqbhEW6E72GNHn0iIM7Ui1GgB8jny91wYnXAIb8";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email || "bapendapedua@gmail.com";
    const password = body.password || "bapenda123";
    const percentage = Math.min(100, Math.max(1, Number(body.percentage) || 50));
    const accessName = body.accessName || `API Publik Kasir (${percentage}%)`;

    // 1. Autentikasi langsung ke Olsera Backoffice
    const authRes = await fetch(`${OLSERA_BASE_URL}oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        device: "123123123",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: email,
        password: password,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "password",
      }),
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      return NextResponse.json(
        {
          status: "error",
          message: `Gagal login ke Olsera (${authRes.status}). Periksa email dan password Anda.`,
          detail: errText,
        },
        { status: 401 }
      );
    }

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    // 2. Dapatkan daftar store / outlet yang terhubung dengan akun Olsera ini
    const storeRes = await fetch(`${OLSERA_BASE_URL}api/store?per_page=50&page=1`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    let storeUrlId = "naikicafe";
    let storeName = "Naiki cafe";
    let station = "635C";

    if (storeRes.ok) {
      const storeData = await storeRes.json();
      if (storeData.data && storeData.data.length > 0) {
        const firstStore = storeData.data[0];
        storeUrlId = firstStore.url_id || "naikicafe";
        storeName = firstStore.name || "Naiki cafe";
      }
    }

    // 3. Tarik otomatis seluruh laporan transaksi dari Olsera
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const startStr = body.startDate || thirtyDaysAgo.toISOString().split("T")[0];
    const endStr = body.endDate || today.toISOString().split("T")[0];

    let totalIngested = 0;
    const maxPagesToFetch = body.maxPages ? Number(body.maxPages) : 4; // default 400 data per sinkronisasi cepat

    for (let page = 1; page <= maxPagesToFetch; page++) {
      const txRes = await fetch(
        `${OLSERA_BASE_URL}api/${storeUrlId}/admin/v1/id/salesreports/taxation/salesdetails?start_date=${startStr}&end_date=${endStr}&page=${page}&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      if (!txRes.ok) break;

      const txJson = await txRes.json();
      const items = txJson.data || [];
      if (items.length === 0) break;

      for (const item of items) {
        const orderDateStr = item.order_date
          ? item.order_date.split(" ")[0]
          : item.order_time.split(" ")[0];

        station = item.station || station;

        await prisma.transaction.upsert({
          where: { orderNo: item.order_no },
          update: {
            orderTime: new Date(item.order_time),
            orderDate: orderDateStr,
            paymentModeId: item.payment_mode_id ? Number(item.payment_mode_id) : null,
            paymentModeName: item.payment_mode_name || "Lainnya",
            subtotal: Number(item.subtotal) || 0,
            tax: Number(item.tax) || 0,
            discount: Number(item.discount) || 0,
            serviceCharge: Number(item.service_charge) || 0,
            rounding: Number(item.rounding) || 0,
            paidAmount: Number(item.paid_amount) || 0,
            voided: Number(item.voided) || 0,
            station: item.station || "635C",
            storeUrlId,
            storeName,
          },
          create: {
            orderNo: item.order_no,
            orderTime: new Date(item.order_time),
            orderDate: orderDateStr,
            paymentModeId: item.payment_mode_id ? Number(item.payment_mode_id) : null,
            paymentModeName: item.payment_mode_name || "Lainnya",
            subtotal: Number(item.subtotal) || 0,
            tax: Number(item.tax) || 0,
            discount: Number(item.discount) || 0,
            serviceCharge: Number(item.service_charge) || 0,
            rounding: Number(item.rounding) || 0,
            paidAmount: Number(item.paid_amount) || 0,
            voided: Number(item.voided) || 0,
            station: item.station || "635C",
            storeUrlId,
            storeName,
          },
        });
        totalIngested++;
      }

      if (page >= (txJson.meta?.last_page || 1)) break;
    }

    // 4. Secara otomatis buatkan API Public yang telah terfilter persentase
    const generatedKey = `sk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

    const newApiKey = await prisma.apiKey.create({
      data: {
        name: accessName,
        key: generatedKey,
        description: `API Publik otomatis dari akun ${email} (${storeName}) dengan filter ${percentage}%`,
        outlet: station,
        percentage: percentage,
        startDate: startStr,
        endDate: endStr,
        paymentModes: JSON.stringify(["Qris BCA", "Cash", "ShopeePay", "Lainnya"]),
        maxPerRequest: 100,
        status: "active",
      },
    });

    // Catat log sinkronisasi
    await prisma.syncLog.create({
      data: {
        source: `olsera:${email}:${storeUrlId}`,
        status: "SUCCESS",
        recordsIngested: totalIngested,
        message: `Koneksi akun ${email} berhasil: ${totalIngested} transaksi disimpan. API Publik dibuat dengan filter ${percentage}%.`,
      },
    });

    // Hitung total transaksi di database
    const totalInDb = await prisma.transaction.count();
    const estimatedFiltered = Math.round((totalInDb * percentage) / 100);

    return NextResponse.json({
      status: "success",
      message: `Akun Olsera berhasil terhubung! ${totalIngested} transaksi otomatis ditarik dan API Publik dengan filter ${percentage}% telah dibuat.`,
      store: {
        name: storeName,
        urlId: storeUrlId,
        station: station,
      },
      stats: {
        totalIngested,
        totalInDb,
        percentage,
        estimatedFiltered,
      },
      apiKey: {
        id: newApiKey.id,
        name: newApiKey.name,
        key: newApiKey.key,
        percentage: newApiKey.percentage,
        publicUrl: `/api/v1/public/transactions`,
        previewUrl: `/data-api/preview?keyId=${newApiKey.id}`,
      },
    });
  } catch (error: any) {
    console.error("Gagal connect Olsera:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Gagal menghubungkan akun Olsera" },
      { status: 500 }
    );
  }
}
