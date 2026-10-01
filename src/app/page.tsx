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
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          subtitle="Ringkasan aktivitas API dan transaksi kasir Anda."
          onSyncComplete={fetchStats}
        />

        <main className="p-8 space-y-8">
          {/* Top 4 Metrics Cards */}
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
            {/* Tren Chart (Span 2 cols) */}
            <div className="lg:col-span-2 rounded-2xl border border-navy-800 bg-navy-900/60 p-6">
              <TrendLineChart data={d.trendChart} />
            </div>

            {/* Donut Chart (Span 1 col) */}
            <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6">
              <DonutChart
                data={d.paymentModesDonut}
                totalLabel={d.totalApiDataToday?.toLocaleString("id-ID")}
              />
            </div>
          </div>

          {/* Banner Quick Link to Preview Filter */}
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-900/40 to-navy-900/60 p-6 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>Halaman Preview Data Terfilter</span>
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
                  Fitur Unggulan
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Cek dan pastikan data hasil filter persentase sebelum di-expose ke pihak eksternal. Anda dapat melihat persis berapa data yang keluar dan format JSON yang akan diterima pemanggil API.
              </p>
            </div>
            <Link
              href="/data-api/preview"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
            >
              <span>Buka Preview Filter</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
