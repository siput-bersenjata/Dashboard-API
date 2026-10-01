"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import {
  Settings,
  ShieldCheck,
  RefreshCw,
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  Database,
} from "lucide-react";

export default function PengaturanPage() {
  const [syncing, setSyncing] = useState(false);
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-30");
  const [maxPages, setMaxPages] = useState(5);
  const [syncResult, setSyncResult] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const handleRunFullSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/olsera/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, maxPages }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncResult({
          type: "success",
          text: data.message || `Sukses mensinkronkan ${data.totalIngested} transaksi!`,
        });
      } else {
        setSyncResult({ type: "error", text: data.message || "Gagal melakukan sinkronisasi." });
      }
    } catch (e: any) {
      setSyncResult({ type: "error", text: e.message || "Kesalahan jaringan." });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <div className="flex-1 pl-64">
        <Header
          title="Pengaturan"
          subtitle="Atur kredensial Olsera Backoffice, pemicu sinkronisasi data, dan konfigurasi API."
        />

        <main className="p-8 space-y-6 max-w-4xl">
          {/* Akun Olsera Backoffice */}
          <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Akun Olsera Backoffice</h3>
                <p className="text-xs text-slate-400">
                  Kredensial resmi untuk integrasi OAuth2 data transaksi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-navy-800 bg-navy-950 p-3.5">
                <span className="text-slate-400 block mb-1">Email Akun</span>
                <span className="font-semibold text-white">bapendapedua@gmail.com</span>
              </div>

              <div className="rounded-xl border border-navy-800 bg-navy-950 p-3.5">
                <span className="text-slate-400 block mb-1">Status Autentikasi</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Terhubung (Role: Perpajakan / PJ)
                </span>
              </div>

              <div className="rounded-xl border border-navy-800 bg-navy-950 p-3.5">
                <span className="text-slate-400 block mb-1">Nama Outlet Terkoneksi</span>
                <span className="font-semibold text-white">Naiki Cafe (Store ID: 175605)</span>
              </div>

              <div className="rounded-xl border border-navy-800 bg-navy-950 p-3.5">
                <span className="text-slate-400 block mb-1">Station Kasir Utama</span>
                <span className="font-semibold text-white">Station 635C</span>
              </div>
            </div>
          </div>

          {/* Form Pemicu Sinkronisasi Manual */}
          <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Sinkronisasi Data Transaksi</h3>
                  <p className="text-xs text-slate-400">
                    Tarik data transaksi dari Olsera ke database lokal/cloud
                  </p>
                </div>
              </div>

              {syncResult && (
                <div
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium ${
                    syncResult.type === "success"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {syncResult.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>{syncResult.text}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Dari Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-navy-700 bg-navy-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-navy-700 bg-navy-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Batas Halaman</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="w-full rounded-xl border border-navy-700 bg-navy-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">100 data/halaman</span>
              </div>
            </div>

            <button
              onClick={handleRunFullSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Sedang Menyinkronkan..." : "Jalankan Sinkronisasi Penuh"}</span>
            </button>
          </div>

          {/* Vercel Deployment & Cron Guide */}
          <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Konfigurasi Otomatisasi & Vercel Cron</h3>
                <p className="text-xs text-slate-400">
                  Pengaturan jadwal penarikan otomatis saat di-deploy ke Vercel
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-navy-800 bg-navy-950 p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold text-white">Endpoint Cron Vercel:</span>
                <code className="rounded bg-navy-900 px-2 py-0.5 font-mono text-blue-400">
                  GET /api/cron/sync
                </code>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold text-white">Jadwal Cron Aktif:</span>
                <span className="text-emerald-400">Setiap Hari Pukul 00:00 UTC (cron: 0 0 * * *)</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-navy-800">
                Sistem akan secara otomatis menarik laporan transaksi hari sebelumnya dan memperbarui database secara berkala tanpa intervensi manual.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
