/**
 * Hash deterministik sederhana (DJB2 variant) untuk string orderNo
 * Mengembalikan nilai integer 0 - 99 secara seragam & konsisten
 */
export function hashOrderNoToPercentile(orderNo: string): number {
  let hash = 5381;
  for (let i = 0; i < orderNo.length; i++) {
    hash = (hash * 33) ^ orderNo.charCodeAt(i);
  }
  // Pastikan hasil selalu non-negatif
  return Math.abs(hash) % 100;
}

export interface FilterOptions {
  percentage?: number; // 10 s/d 100
  startDate?: string;
  endDate?: string;
  paymentModes?: string[];
  station?: string;
  limit?: number;
}

export interface TransactionRecord {
  id: string;
  orderNo: string;
  orderTime: Date | string;
  orderDate: string;
  paymentModeId: number | null;
  paymentModeName: string;
  subtotal: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  rounding: number;
  paidAmount: number;
  voided: number;
  station: string;
  storeUrlId: string;
  storeName: string;
}

/**
 * Menerapkan filter persentase deterministik dan kriteria tambahan
 */
export function applyDeterministicFilter(
  records: TransactionRecord[],
  options: FilterOptions
): {
  data: TransactionRecord[];
  totalRaw: number;
  totalFiltered: number;
  percentageApplied: number;
} {
  const percentage = Math.min(100, Math.max(1, options.percentage ?? 100));

  let filtered = records;

  // Filter rentang tanggal
  if (options.startDate) {
    filtered = filtered.filter((r) => r.orderDate >= options.startDate!);
  }
  if (options.endDate) {
    filtered = filtered.filter((r) => r.orderDate <= options.endDate!);
  }

  // Filter metode pembayaran jika ditentukan
  if (options.paymentModes && options.paymentModes.length > 0) {
    const modesSet = new Set(options.paymentModes.map((m) => m.toLowerCase()));
    filtered = filtered.filter((r) =>
      modesSet.has(r.paymentModeName.toLowerCase())
    );
  }

  // Filter station / outlet kasir jika ada
  if (options.station && options.station !== "Semua Kasir") {
    filtered = filtered.filter((r) => r.station === options.station);
  }

  const countBeforePercentage = filtered.length;

  // Filter persentase deterministik:
  // Jika percentage < 100, ambil hanya transaksi dengan hash percentile < percentage
  if (percentage < 100) {
    filtered = filtered.filter(
      (r) => hashOrderNoToPercentile(r.orderNo) < percentage
    );
  }

  const totalFiltered = filtered.length;

  // Terapkan limit/paging jika ada
  if (options.limit && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }

  return {
    data: filtered,
    totalRaw: records.length,
    totalFiltered: totalFiltered,
    percentageApplied: percentage,
  };
}
