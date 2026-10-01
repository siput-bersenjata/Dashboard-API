"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import { TrendLineChart, DonutChart } from "@/components/Charts";
import {
  CreditCard,
  Database,
  Users,
  CheckCircle,
  KeyRound,
  Sliders,
  Check,
  Copy,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  Receipt,
  Search,
  Code,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form Input Akun Olsera
  const [email, setEmail] = useState("bapendapedua@gmail.com");
  const [password, setPassword] = useState("bapenda123");
  const [percentage, setPercentage] = useState(50);
  const [connecting, setConnecting] = useState(false);
  const [connectStep, setConnectStep] = useState<string>("");
  const [connectResult, setConnectResult] = useState<any>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  // State untuk API Key aktif & Live Filter Preview di Dashboard
  const [activeApiKey, setActiveApiKey] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [savingPercentage, setSavingPercentage] = useState(false);
  const [searchTable, setSearchTable] = useState("");

  // Ambil data statistik & status API dari Vercel
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const json = await res.json();
      if (json.status === "success") {
        setData(json);
        if (json.activeApiKey) {
          setActiveApiKey(json.activeApiKey);
          setPercentage(json.activeApiKey.percentage || 50);
          fetchPreview(json.activeApiKey.percentage || 50, json.activeApiKey.id);
        } else {
          fetchPreview(50);
        }
      }
    } catch (e) {
      console.error("Gagal mengambil stats:", e);
    } finally {
      setLoading(false);
    }
  };

  // Ambil preview live data transaksi terfilter berdasarkan persentase
  const fetchPreview = async (pct: number, keyId?: string) => {
    setLoadingPreview(true);
    try {
      const res = await fetch("/api/v1/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKeyId: keyId || activeApiKey?.id || undefined,
          percentage: pct,
          limit: 15,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        setPreviewData(json);
      }
    } catch (err) {
      console.error("Gagal mengambil preview data:", err);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Handler: Tarik data dari Olsera -> simpan ke database Vercel -> buatkan Public API
  const handleConnectOlsera = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setConnectError(null);

    try {
      setConnectStep("1. Mengautentikasi akun ke Olsera Backoffice OAuth...");
      await new Promise((r) => setTimeout(r, 600));

      setConnectStep("2. Mendeteksi outlet kasir & menarik data transaksi...");
      const res = await fetch("/api/olsera/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          percentage,
          accessName: `API Publik Kasir (${percentage}%)`,
          maxPages: 4,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || "Gagal menghubungkan ke Olsera");
      }

      setConnectStep("3. Menyimpan ke database Vercel & membuat Public API...");
      await new Promise((r) => setTimeout(r, 600));

      setConnectResult(json);
      setActiveApiKey(json.apiKey);
      await fetchStats();
      await fetchPreview(percentage, json.apiKey?.id);
    } catch (err: any) {
      setConnectError(err.message || "Terjadi kesalahan saat memproses data.");
    } finally {
      setConnecting(false);
      setConnectStep("");
    }
  };

  // Handler slider persentase berubah
  const handleSliderChange = (newVal: number) => {
    setPercentage(newVal);
    fetchPreview(newVal, activeApiKey?.id);
  };

  // Handler simpan perubahan persentase ke API Key di database
  const handleSavePercentage = async () => {
    if (!activeApiKey?.id) return;
    setSavingPercentage(true);
    try {
      const res = await fetch("/api/v1/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeApiKey.id,
          percentage,
          name: `API Publik Kasir (${percentage}%)`,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        setActiveApiKey(json.data);
        alert(`Persentase API berhasil diperbarui menjadi ${percentage}%!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPercentage(false);
    }
  };

  const handleCopyKey = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyCurl = (keyText: string) => {
    const host = typeof window !== "undefined" ? window.location.host : "dashboard-api-sandy.vercel.app";
    const snippet = `curl -X GET "https://${host}/api/v1/public/transactions" \\\n  -H "x-api-key: ${keyText}"`;
    navigator.clipboard.writeText(snippet);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2500);
  };

  const d = data?.dashboard || {
    totalTransactions: 400,
    totalTodayTransactions: 400,
    totalApiDataToday: 2482,
    totalAksesKasir: 3,
    uptimeApi: "99.9%",
    trendChart: [],
    paymentModesDonut: [],
  };

  const currentKeyString = activeApiKey?.key || connectResult?.apiKey?.key || "sk_live_p50_samplekey";
  const currentKeyName = activeApiKey?.name || connectResult?.apiKey?.name || `API Publik Kasir (${percentage}%)`;

  const totalRawCount = previewData?.stats?.totalRaw || d.totalTransactions || 400;
  const filteredCount = previewData?.stats?.totalFiltered || Math.round((totalRawCount * percentage) / 100);

  const filteredRows = useMemo(() => {
    const rows = previewData?.data || [];
    if (!searchTable) return rows;
    return rows.filter((r: any) =>
      r.orderNo?.toLowerCase().includes(searchTable.toLowerCase()) ||
      r.paymentModeName?.toLowerCase().includes(searchTable.toLowerCase())
    );
  }, [previewData, searchTable]);

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <div className="flex-1 pl-64">
        <Header
          title="Dashboard"
          subtitle="Tarik otomatis data transaksi Olsera ke database Vercel dan buatkan API publik dengan filter persentase."
          onSyncComplete={fetchStats}
        />

        <main className="p-8 space-y-8">
          {/* ========================================================= */}
          {/* ALUR UTAMA: INPUT AKUN OLSERA -> TARIK DATA -> BUAT API */}
          {/* ========================================================= */}
          <section className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-navy-900 via-navy-900/90 to-blue-950/40 p-7 shadow-xl shadow-black/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Integrasi Akun Olsera & Generator API Publik Terfilter</span>
                    <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400 border border-blue-500/30">
                      Otomatis 100%
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    User tinggal masukkan akun Olsera. Data ditarik otomatis ke database Vercel, lalu dibuatkan API Publik yang datanya bisa diatur berapa persen dari data aslinya.
                  </p>
                </div>
              </div>

              {/* Status Outlet Olsera */}
              <div className="flex items-center gap-2 rounded-xl bg-navy-950 px-3.5 py-1.5 border border-navy-800 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-medium">
                  {data?.storeInfo?.storeName ? `Outlet: ${data.storeInfo.storeName}` : "Olsera API Ready"}
                </span>
              </div>
            </div>

            {/* Form Input Akun Olsera */}
            <form onSubmit={handleConnectOlsera} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    Email Akun Olsera Backoffice
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="bapendapedua@gmail.com"
                    className="w-full rounded-xl border border-navy-700 bg-navy-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Contoh akun terverifikasi: <code className="text-blue-300">bapendapedua@gmail.com</code>
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-blue-400" />
                    Password Akun Olsera
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="bapenda123"
                    className="w-full rounded-xl border border-navy-700 bg-navy-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Password akun: <code className="text-blue-300">bapenda123</code>
                  </span>
                </div>
              </div>

              {/* Slider Pengaturan Persentase Data yang Keluar dari API */}
              <div className="rounded-2xl border border-blue-500/25 bg-blue-950/30 p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-blue-400" />
                      Atur Persentase Data yang Dikeluarkan oleh API
                    </label>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Geser untuk menentukan berapa persen data transaksi asli Olsera yang dapat ditarik oleh pihak luar melalui API.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Data Keluar:</span>
                    <span className="rounded-xl bg-blue-600 px-3.5 py-1 text-sm font-bold text-white shadow-md shadow-blue-600/30">
                      {percentage}%
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={percentage}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-full h-2.5 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>10% (Sampel Minim)</span>
                  <span>30%</span>
                  <span>50% (Separuh Data Asli)</span>
                  <span>70%</span>
                  <span>100% (Seluruh Data Asli)</span>
                </div>
              </div>

              {/* Tombol Eksekusi Penarikan & Pembuatan API */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                <div className="text-xs text-slate-400">
                  {connecting && (
                    <span className="text-blue-400 flex items-center gap-2 font-medium">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      {connectStep}
                    </span>
                  )}
                  {connectError && (
                    <span className="text-red-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="h-4 w-4" />
                      {connectError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={connecting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50 transition"
                >
                  <RefreshCw className={`h-4 w-4 ${connecting ? "animate-spin" : ""}`} />
                  <span>
                    {connecting
                      ? "Sedang Menghubungkan & Menarik Data..."
                      : "⚡ Tarik Data Olsera & Buat Public API"}
                  </span>
                </button>
              </div>
            </form>

            {/* ========================================================= */}
            {/* HASIL OTOMATIS: API PUBLIK & STATISTIK FILTER LANGSUNG */}
            {/* ========================================================= */}
            {(activeApiKey || connectResult) && (
              <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                    <CheckCircle className="h-5 w-5" />
                    <span>Data Olsera Berhasil Disimpan di Vercel & API Publik Aktif!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 bg-navy-950 px-3 py-1 rounded-lg border border-navy-800">
                      Nama Akses: <strong className="text-white">{currentKeyName}</strong>
                    </span>
                  </div>
                </div>

                {/* 3 Kotak Perbandingan Data Transaksi Asli vs Filter */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-xl border border-navy-800 bg-navy-950 p-4">
                    <span className="text-slate-400 block mb-1">Total Data Asli Olsera di Database</span>
                    <span className="text-2xl font-bold text-white">
                      {totalRawCount.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">Transaksi lengkap ditarik</span>
                  </div>

                  <div className="rounded-xl border border-blue-500/30 bg-blue-950/25 p-4">
                    <span className="text-blue-300 block mb-1">Pengaturan Filter Persentase</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-400">{percentage}%</span>
                      <span className="text-[11px] text-slate-400">dari data asli</span>
                    </div>
                    {activeApiKey && activeApiKey.percentage !== percentage && (
                      <button
                        onClick={handleSavePercentage}
                        disabled={savingPercentage}
                        className="mt-2 text-[11px] font-bold text-blue-300 hover:text-white underline block"
                      >
                        {savingPercentage ? "Menyimpan..." : "💾 Simpan perubahan persentase ini ke API"}
                      </button>
                    )}
                  </div>

                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-4">
                    <span className="text-emerald-300 block mb-1">Jumlah Data yang Keluar dari API</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {filteredCount.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Transaksi yang lolos filter
                    </span>
                  </div>
                </div>

                {/* API Key, URL Endpoint & cURL Snippet */}
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">
                        Kunci Akses API Publik (x-api-key):
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="rounded bg-navy-900 px-3 py-1 font-mono text-xs text-emerald-400 border border-navy-800">
                          {currentKeyString}
                        </code>
                        <button
                          onClick={() => handleCopyKey(currentKeyString)}
                          className="flex items-center gap-1 rounded-lg bg-navy-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition"
                        >
                          {copiedKey ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>{copiedKey ? "Tersalin" : "Salin Kunci"}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyCurl(currentKeyString)}
                      className="flex items-center gap-1.5 rounded-xl border border-navy-700 bg-navy-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-navy-850 transition"
                    >
                      {copiedCurl ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Code className="h-3.5 w-3.5 text-blue-400" />
                      )}
                      <span>{copiedCurl ? "cURL Tersalin!" : "Salin Perintah cURL"}</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-navy-800/80">
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-blue-400" />
                      Endpoint API: <code className="text-blue-300 font-mono">/api/v1/public/transactions</code>
                    </span>
                    <span className="text-slate-400">
                      Query override opsional: <code className="text-slate-300 font-mono">?percentage={percentage}&limit=100</code>
                    </span>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* LIVE TABLE PREVIEW DATA TERFILTER DI DASHBOARD */}
                {/* ========================================================= */}
                <div className="rounded-2xl border border-navy-800 bg-navy-900/80 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-emerald-400" />
                        Preview Data Transaksi yang Keluar dari API ({filteredRows.length} dari {filteredCount} data)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tabel ini menampilkan baris transaksi presisi yang telah terfilter sesuai persentase {percentage}%.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Cari order no..."
                          value={searchTable}
                          onChange={(e) => setSearchTable(e.target.value)}
                          className="w-48 rounded-xl border border-navy-700 bg-navy-950 pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <Link
                        href={`/data-api/preview?keyId=${activeApiKey?.id || ""}`}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Halaman Khusus Full Preview</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Tabel Data Transaksi Terfilter */}
                  <div className="overflow-x-auto rounded-xl border border-navy-800">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-navy-800 bg-navy-950 text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-semibold">No. Order</th>
                          <th className="px-4 py-3 font-semibold">Waktu Transaksi</th>
                          <th className="px-4 py-3 font-semibold">Metode Bayar</th>
                          <th className="px-4 py-3 font-semibold">Kasir</th>
                          <th className="px-4 py-3 font-semibold text-right">Subtotal</th>
                          <th className="px-4 py-3 font-semibold text-right">Pajak (PB1)</th>
                          <th className="px-4 py-3 font-semibold text-right">Total Bayar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-800/60 text-slate-300">
                        {loadingPreview ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                              Memperbarui preview filter transaksi...
                            </td>
                          </tr>
                        ) : filteredRows.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                              Tidak ada transaksi yang cocok dengan filter.
                            </td>
                          </tr>
                        ) : (
                          filteredRows.slice(0, 8).map((tx: any) => (
                            <tr key={tx.orderNo} className="hover:bg-navy-850/50 transition">
                              <td className="px-4 py-2.5 font-mono text-white font-medium">
                                {tx.orderNo}
                              </td>
                              <td className="px-4 py-2.5 text-slate-400">
                                {new Date(tx.orderTime).toLocaleString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="inline-flex items-center rounded-md bg-navy-950 px-2 py-0.5 text-[11px] font-semibold text-blue-300 border border-navy-800">
                                  {tx.paymentModeName}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-slate-400">{tx.station || "635C"}</td>
                              <td className="px-4 py-2.5 text-right font-medium">
                                Rp {tx.subtotal.toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-2.5 text-right font-medium text-amber-400">
                                Rp {tx.tax.toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-2.5 text-right font-bold text-emerald-400">
                                Rp {tx.paidAmount.toLocaleString("id-ID")}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ========================================================= */}
          {/* STATISTIK & METRIK DASHBOARD (KASIR API) */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Transaksi (Hari ini)"
              value={d.totalTodayTransactions?.toLocaleString("id-ID") || "400"}
              badgeText="12% dari kemarin"
              badgeType="increase"
              icon={<CreditCard className="h-5 w-5" />}
              iconBgColor="bg-blue-600/20 text-blue-400"
            />

            <MetricCard
              title="Jumlah Data API (Hari ini)"
              value={d.totalApiDataToday?.toLocaleString("id-ID") || "2.482"}
              badgeText="18% dari kemarin"
              badgeType="increase"
              icon={<Database className="h-5 w-5" />}
              iconBgColor="bg-emerald-600/20 text-emerald-400"
            />

            <MetricCard
              title="Total Akses Kasir"
              value={d.totalAksesKasir || "3"}
              badgeText="Aktif"
              badgeType="status"
              icon={<Users className="h-5 w-5" />}
              iconBgColor="bg-purple-600/20 text-purple-400"
            />

            <MetricCard
              title="Uptime API"
              value={d.uptimeApi || "99.9%"}
              badgeText="Normal"
              badgeType="normal"
              icon={<CheckCircle className="h-5 w-5" />}
              iconBgColor="bg-emerald-500/20 text-emerald-400"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-navy-800 bg-navy-900/60 p-6">
              <TrendLineChart data={d.trendChart} />
            </div>

            <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6">
              <DonutChart
                data={d.paymentModesDonut}
                totalLabel={d.totalApiDataToday?.toLocaleString("id-ID")}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
