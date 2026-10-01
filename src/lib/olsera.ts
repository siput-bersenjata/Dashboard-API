import { prisma } from "./prisma";

const OLSERA_BASE_URL = "https://api-dash.olsera.co.id/";
const CLIENT_ID = 2;
const CLIENT_SECRET = "0XqbhEW6E72GNHn0iIM7Ui1GgB8jny91wYnXAIb8";

interface OlseraTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

interface OlseraStore {
  store_id: number;
  name: string;
  url_id: string;
  role_id: string;
  role_name: string;
  is_store_active: number;
  currency_id: string;
}

interface OlseraSalesItem {
  order_no: string;
  order_time: string;
  forder_time: string;
  payment_mode_id: number | null;
  payment_mode_name: string;
  subtotal: number | string;
  tax: number | string;
  discount: number | string;
  service_charge: number | string;
  rounding: number | string;
  paid_amount: number | string;
  voided: number;
  station: string;
  order_date: string;
}

let cachedToken: string | null = null;
let tokenExpiryTime: number = 0;

export async function getOlseraToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedToken && now < tokenExpiryTime - 60000) {
    return cachedToken;
  }

  const email = process.env.OLSERA_EMAIL || "bapendapedua@gmail.com";
  const password = process.env.OLSERA_PASSWORD || "bapenda123";

  const response = await fetch(`${OLSERA_BASE_URL}oauth/token`, {
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal autentikasi ke Olsera: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as OlseraTokenResponse;
  cachedToken = data.access_token;
  tokenExpiryTime = now + (data.expires_in || 2592000) * 1000;

  return cachedToken;
}

export async function fetchOlseraStores(): Promise<OlseraStore[]> {
  const token = await getOlseraToken();
  const res = await fetch(`${OLSERA_BASE_URL}api/store?per_page=50&page=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal mengambil data store Olsera: ${res.status}`);
  }

  const json = await res.json();
  return json.data || [];
}

export async function fetchOlseraTransactionsRange(
  storeUrlId: string,
  startDate: string,
  endDate: string,
  page = 1,
  perPage = 100
): Promise<{ data: OlseraSalesItem[]; meta: any }> {
  const token = await getOlseraToken();
  const url = `${OLSERA_BASE_URL}api/${storeUrlId}/admin/v1/id/salesreports/taxation/salesdetails?start_date=${startDate}&end_date=${endDate}&page=${page}&per_page=${perPage}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal fetch sales Olsera (${startDate} s/d ${endDate}): ${res.status} - ${errText}`);
  }

  const json = await res.json();
  return {
    data: json.data || [],
    meta: json.meta || {},
  };
}

export async function syncOlseraTransactions(options?: {
  startDate?: string;
  endDate?: string;
  storeUrlId?: string;
  maxPages?: number;
}): Promise<{ totalIngested: number; message: string }> {
  const storeUrlId = options?.storeUrlId || process.env.OLSERA_STORE_URL_ID || "naikicafe";
  const storeName = process.env.OLSERA_STORE_NAME || "Naiki cafe";

  // Default: last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startStr = options?.startDate || thirtyDaysAgo.toISOString().split("T")[0];
  const endStr = options?.endDate || today.toISOString().split("T")[0];
  const maxPages = options?.maxPages || 10;

  let totalIngested = 0;
  let currentPage = 1;
  let hasMore = true;

  try {
    while (hasMore && currentPage <= maxPages) {
      const result = await fetchOlseraTransactionsRange(storeUrlId, startStr, endStr, currentPage, 100);
      const items = result.data;

      if (!items || items.length === 0) {
        hasMore = false;
        break;
      }

      for (const item of items) {
        const orderDateStr = item.order_date
          ? item.order_date.split(" ")[0]
          : item.order_time.split(" ")[0];

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
            storeUrlId: storeUrlId,
            storeName: storeName,
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
            storeUrlId: storeUrlId,
            storeName: storeName,
          },
        });
        totalIngested++;
      }

      const totalPages = result.meta?.last_page || 1;
      if (currentPage >= totalPages) {
        hasMore = false;
      } else {
        currentPage++;
      }
    }

    await prisma.syncLog.create({
      data: {
        source: `olsera:${storeUrlId}`,
        status: "SUCCESS",
        recordsIngested: totalIngested,
        message: `Sinkronisasi berhasil: ${totalIngested} transaksi disimpan/diperbarui (${startStr} s/d ${endStr})`,
      },
    });

    return {
      totalIngested,
      message: `Berhasil mensinkronkan ${totalIngested} transaksi dari Olsera (${startStr} s/d ${endStr}).`,
    };
  } catch (error: any) {
    await prisma.syncLog.create({
      data: {
        source: `olsera:${storeUrlId}`,
        status: "FAILED",
        recordsIngested: totalIngested,
        message: `Sinkronisasi gagal: ${error.message}`,
      },
    });
    throw error;
  }
}
