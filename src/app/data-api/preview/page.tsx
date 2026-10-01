"use client";

import { Suspense, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import {
  Sliders,
  Database,
  ArrowRight,
  Code,
  Copy,
  Check,
  RefreshCw,
  Search,
  Receipt,
  CheckCircle2,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function PreviewFilterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy-950 flex items-center justify-center text-slate-400 text-sm">
          Memuat halaman preview data...
        </div>
      }
    >
      <PreviewFilterContent />
    </Suspense>
  );
}

function PreviewFilterContent() {
  const searchParams = useSearchParams();
  const initialKeyId = searchParams.get("keyId") || "";

  const [keys, setKeys] = useState<any[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string>(initialKeyId);
  const [customPercentage, setCustomPercentage] = useState<number>(50);
  const [customStartDate, setCustomStartDate] = useState<string>("2026-09-01");
  const [customEndDate, setCustomEndDate] = useState<string>("2026-09-30");

  const [previewResult, setPreviewResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load API Keys
  useEffect(() => {
    fetch("/api/v1/keys")
      .then((r) => r.json())
      .then((json) => {
        if (json.status === "success") {
          setKeys(json.data);
          if (!selectedKeyId && json.data.length > 0) {
            setSelectedKeyId(json.data[0].id);
          }
        }
      });
  }, []);

  // Update preview whenever key or percentage changes
  const runPreview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKeyId: selectedKeyId || undefined,
          percentage: customPercentage,
          startDate: customStartDate,
          endDate: customEndDate,
          limit: 100,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        setPreviewResult(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedKeyId || customPercentage) {
      const keyObj = keys.find((k) => k.id === selectedKeyId);
      if (keyObj) {
        setCustomPercentage(keyObj.percentage);
      }
      runPreview();
    }
  }, [selectedKeyId]);

  const handleSliderChange = (newVal: number) => {
    setCustomPercentage(newVal);
  };

  const handleCopyCurl = () => {
    const selectedKey = keys.find((k) => k.id === selectedKeyId);
    const keyString = selectedKey ? selectedKey.key : "sk_live_sample";
    const host = typeof window !== "undefined" ? window.location.host : "dashboard-api-sandy.vercel.app";
    const snippet = `curl -X GET "https://${host}/api/v1/public/transactions" \\
  -H "x-api-key: ${keyString}"`;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const stats = previewResult?.stats || {
    totalRaw: 0,
    totalFiltered: 0,
    totalReturned: 0,
    totalGross: 0,
    totalTax: 0,
    totalPaid: 0,
    paymentDistribution: {},
  };

  const transactions = (previewResult?.data || []).filter((tx: any) =>
    searchTerm
      ? tx.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.paymentModeName.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const selectedKeyObj = keys.find((k) => k.id === selectedKeyId);

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <div className="flex-1 pl-64">
        <Header
          title="Halaman Preview Data yang Akan Keluar dari API"
          subtitle="Tinjau tabel data transaksi secara transparan setelah filter persentase diterapkan."
        />

        <main className="p-8 space-y-6">
          {/* Top Panel: Pilih Kunci & Pengatur Persentase */}
          <div className="rounded-3xl border border-navy-800 bg-navy-900/80 p-6 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dropdown API Key */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2">
                  Pilih Kunci Akses API
                </label>
                <select
                  value={selectedKeyId}
                  onChange={(e) => setSelectedKeyId(e.target.value)}
                  className="w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  {keys.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} — Filter {k.percentage}%
                    </option>
                  ))}
                  <option value="">-- Kustom Slider Bebas --</option>
                </select>
                {selectedKeyObj && (
                  <div className="mt-2 text-[11px] text-slate-400 font-mono">
                    API Key: <span className="text-emerald-400">{selectedKeyObj.key.slice(0, 14)}...{selectedKeyObj.key.slice(-4)}</span>
                  </div>
                )}
              </div>

              {/* Live Interactive Slider */}
              <div className="md:col-span-2 rounded-2xl border border-blue-500/25 bg-blue-950/25 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">
                      Ubah Filter Persentase Data yang Dikeluarkan
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">Hasil Filter:</span>
                    <span className="rounded-xl bg-blue-600 px-3 py-1 text-sm font-bold text-white shadow-md shadow-blue-600/30">
                      {customPercentage}%
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={customPercentage}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  onMouseUp={runPreview}
                  onTouchEnd={runPreview}
                  className="w-full h-2.5 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>10% (Sampel Minim)</span>
                  <span>50% (Separuh Data Asli)</span>
                  <span>75%</span>
                  <span>100% (Seluruh Data Asli)</span>
                </div>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-navy-800 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span>Algoritma:</span>
                <span className="rounded-md bg-navy-950 px-2.5 py-1 font-mono text-[11px] text-blue-300 border border-navy-800">
                  Deterministic Order Hashing (Konsisten & Reproducible)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={runPreview}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? "Menghitung..." : "Terapkan & Update Preview"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Kartu Ringkasan Hasil Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-5">
              <div className="text-xs font-medium text-slate-400">Total Data Asli Olsera</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {stats.totalRaw.toLocaleString("id-ID")}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Semua transaksi yang tersimpan</div>
            </div>

            <div className="rounded-2xl border border-blue-500/40 bg-blue-950/20 p-5">
              <div className="text-xs font-semibold text-blue-300">Jumlah Data yang Keluar di API</div>
              <div className="mt-2 text-2xl font-bold text-blue-400">
                {stats.totalFiltered.toLocaleString("id-ID")}
              </div>
              <div className="mt-1 text-[11px] text-blue-300/80">
                Tepat {customPercentage}% data transaksi terpilih
              </div>
            </div>

            <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-5">
              <div className="text-xs font-medium text-slate-400">Total Omset Data Terfilter</div>
              <div className="mt-2 text-2xl font-bold text-emerald-400">
                Rp {stats.totalGross.toLocaleString("id-ID")}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Subtotal dari data terfilter</div>
            </div>

            <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-5">
              <div className="text-xs font-medium text-slate-400">Total Pajak (PB1) Terfilter</div>
              <div className="mt-2 text-2xl font-bold text-amber-400">
                Rp {stats.totalTax.toLocaleString("id-ID")}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Pajak 10% dari transaksi terfilter</div>
            </div>
          </div>

          {/* Tabel Baris per Baris Data yang Akan Keluar dari API */}
          <div className="rounded-3xl border border-navy-800 bg-navy-900/60 p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-400" />
                  Daftar Transaksi Hasil Filter ({transactions.length} baris ditampilkan)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ini adalah data presisi yang akan diterima oleh user atau sistem luar saat memanggil API.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter nomor order..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-52 rounded-xl border border-navy-700 bg-navy-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleCopyCurl}
                  className="flex items-center gap-1.5 rounded-xl border border-navy-700 bg-navy-900 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-navy-800 transition"
                  title="Salin cURL code snippet"
                >
                  {copiedCode ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Code className="h-3.5 w-3.5 text-blue-400" />
                  )}
                  <span>{copiedCode ? "cURL Tersalin!" : "Salin cURL API"}</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-navy-800">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-navy-800 bg-navy-900/90 text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">No. Order</th>
                    <th className="px-5 py-3.5 font-semibold">Waktu Transaksi</th>
                    <th className="px-5 py-3.5 font-semibold">Metode Pembayaran</th>
                    <th className="px-5 py-3.5 font-semibold">Station Kasir</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Subtotal</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Pajak (PB1)</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Total Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 text-slate-300">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                        {loading ? "Memuat preview data..." : "Tidak ada transaksi yang cocok."}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx: any) => (
                      <tr key={tx.orderNo} className="hover:bg-navy-850/50 transition">
                        <td className="px-5 py-3.5 font-mono font-medium text-white">
                          {tx.orderNo}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">
                          {new Date(tx.orderTime).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center rounded-md bg-navy-950 px-2.5 py-1 text-[11px] font-semibold text-blue-300 border border-navy-800">
                            {tx.paymentModeName}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">{tx.station || "635C"}</td>
                        <td className="px-5 py-3.5 text-right font-medium">
                          Rp {tx.subtotal.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium text-amber-400">
                          Rp {tx.tax.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-emerald-400">
                          Rp {tx.paidAmount.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
