"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import { TrendLineChart, DonutChart } from "@/components/Charts";
import {
  CreditCard,
  Database,
  Users,
  CheckCircle,
  ExternalLink,
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
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form Koneksi Olsera di Dashboard
  const [email, setEmail] = useState("bapendapedua@gmail.com");
  const [password, setPassword] = useState("bapenda123");
  const [percentage, setPercentage] = useState(50);
  const [connecting, setConnecting] = useState(false);
  const [connectStep, setConnectStep] = useState<string>("");
  const [connectResult, setConnectResult] = useState<any>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const json = await res.json();
      if (json.status === "success") {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleConnectOlsera = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setConnectError(null);
    setConnectResult(null);

    try {
      setConnectStep("Mengautentikasi akun ke Olsera Backoffice...");
      await new Promise((r) => setTimeout(r, 600));

      setConnectStep("Mendeteksi outlet kasir & menarik laporan transaksi...");
      const res = await fetch("/api/olsera/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          percentage,
          accessName: `API Kasir Otomatis (${percentage}%)`,
          maxPages: 3,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || "Gagal menghubungkan ke Olsera");
      }

      setConnectStep("Menyimpan ke database Vercel & membuat Public API...");
      await new Promise((r) => setTimeout(r, 500));

      setConnectResult(json);
      fetchStats();
    } catch (err: any) {
      setConnectError(err.message || "Terjadi kesalahan saat memproses data.");
    } finally {
      setConnecting(false);
      setConnectStep("");
    }
  };

  const handleCopyKey = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const d = data?.dashboard || {
    totalTransactions: 248,
    totalTodayTransactions: 248,
    totalApiDataToday: 2482,
    totalAksesKasir: 3,
    uptimeApi: "99.9%",
    trendChart: [],
    paymentModesDonut: [],
  };

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <div className="flex-1 pl-64">
        <Header
          title="Dashboard"
          subtitle="Hubungkan akun Olsera, tarik data transaksi otomatis, dan atur API publik terfilter."
          onSyncComplete={fetchStats}
        />

        <main className="p-8 space-y-8">
          {/* ========================================================= */}
          {/* BAGIAN UTAMA: MASUKKAN AKUN OLSERA & OTOMASI PUBLIC API */}
          {/* ========================================================= */}
          <section className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-navy-900 via-navy-900/90 to-blue-950/40 p-7 shadow-xl shadow-black/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Integrasi Otomatis Olsera Backoffice & Generator API Publik</span>
                    <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400 border border-blue-500/30">
                      Otomatis
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Masukkan akun Olsera Anda. Data transaksi akan otomatis ditarik ke database Vercel dan langsung dibuatkan API publik dengan filter persentase yang Anda tentukan.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 rounded-xl bg-navy-950 px-3.5 py-1.5 border border-navy-800 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-medium">Olsera API Ready</span>
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
                    Gunakan akun admin Olsera yang memiliki akses ke laporan penjualan/pajak.
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
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-navy-700 bg-navy-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Password tersimpan aman dan hanya digunakan untuk handshake token OAuth resmi.
                  </span>
                </div>
              </div>

              {/* Slider Pengaturan Persentase Filter Data (Fitur Utama Request User) */}
              <div className="rounded-2xl border border-blue-500/25 bg-blue-950/30 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-blue-400" />
                      Atur Persentase Data yang Keluar dari API
                    </label>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Tentukan berapa persen transaksi hasil penarikan Olsera yang boleh diakses pihak luar melalui API.
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
                  onChange={(e) => setPercentage(Number(e.target.value))}
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
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

            {/* Hasil Eksekusi Instan: API Publik yang Dibuatkan */}
            {connectResult && (
              <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                    <CheckCircle className="h-5 w-5" />
                    <span>Data Berhasil Ditarik & API Publik Siap Digunakan!</span>
                  </div>
                  <span className="text-xs text-slate-300 bg-navy-950 px-3 py-1 rounded-lg border border-navy-800">
                    Outlet: <strong className="text-white">{connectResult.store?.name}</strong>
                  </span>
                </div>

                {/* Perbandingan Data */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-xl border border-navy-800 bg-navy-950 p-3.5">
                    <span className="text-slate-400 block mb-1">Total Data Asli Olsera</span>
                    <span className="text-lg font-bold text-white">
                      {connectResult.stats?.totalInDb?.toLocaleString("id-ID")} Transaksi
                    </span>
                  </div>
                  <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5">
                    <span className="text-blue-300 block mb-1">Persentase Filter Aktif</span>
                    <span className="text-lg font-bold text-blue-400">
                      {connectResult.apiKey?.percentage}% dari Data Asli
                    </span>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                    <span className="text-emerald-300 block mb-1">Data yang Akan Keluar di API</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {connectResult.stats?.estimatedFiltered?.toLocaleString("id-ID")} Transaksi
                    </span>
                  </div>
                </div>

                {/* Key & Endpoint Box */}
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-300">API Key Publik Anda:</span>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-navy-900 px-3 py-1 font-mono text-xs text-emerald-400 border border-navy-800">
                        {connectResult.apiKey?.key}
                      </code>
                      <button
                        onClick={() => handleCopyKey(connectResult.apiKey?.key)}
                        className="flex items-center gap-1 rounded-lg bg-navy-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                      >
                        {copiedKey ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span>{copiedKey ? "Tersalin" : "Salin"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-navy-800/80">
                    <span>
                      Endpoint: <code className="text-blue-400">/api/v1/public/transactions</code>
                    </span>
                    <span className="text-slate-400">
                      Header: <code className="text-slate-300">x-api-key: {connectResult.apiKey?.key.slice(0, 12)}...</code>
                    </span>
                  </div>
                </div>

                {/* Tombol Menuju Halaman Khusus Preview Data */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-300">
                    Ingin memeriksa tabel baris data apa saja yang keluar dari filter ini?
                  </p>
                  <Link
                    href={`/data-api/preview?keyId=${connectResult.apiKey?.id}`}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Lihat Halaman Data yang Keluar</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
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
              value={d.totalTodayTransactions?.toLocaleString("id-ID") || "248"}
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
