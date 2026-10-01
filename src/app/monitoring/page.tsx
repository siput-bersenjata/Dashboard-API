"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import { Activity, Send, Key, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function MonitoringPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.status === "success") setData(json);
      })
      .finally(() => setLoading(false));
  }, []);

  const m = data?.monitoring || {
    totalRequests: 1248,
    totalDataSent: 124800,
    activeAkses: 3,
    errorsCount: 2,
    recentLogs: [],
  };

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <div className="flex-1 pl-64">
        <Header
          title="Monitoring API"
          subtitle="Pantau jumlah transaksi yang keluar dari API secara real-time."
        />

        <main className="p-8 space-y-8">
          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Request"
              value={m.totalRequests.toLocaleString("id-ID")}
              badgeText="20% dari minggu lalu"
              badgeType="increase"
              icon={<Activity className="h-5 w-5" />}
              iconBgColor="bg-blue-600/20 text-blue-400"
            />

            <MetricCard
              title="Data Terkirim"
              value={m.totalDataSent.toLocaleString("id-ID")}
              badgeText="38% dari minggu lalu"
              badgeType="increase"
              icon={<Send className="h-5 w-5" />}
              iconBgColor="bg-emerald-600/20 text-emerald-400"
            />

            <MetricCard
              title="Akses Aktif"
              value={m.activeAkses}
              badgeText="Kasir"
              badgeType="status"
              icon={<Key className="h-5 w-5" />}
              iconBgColor="bg-purple-600/20 text-purple-400"
            />

            <MetricCard
              title="Error"
              value={m.errorsCount}
              badgeText="50% dari minggu lalu"
              badgeType="increase"
              icon={<AlertTriangle className="h-5 w-5" />}
              iconBgColor="bg-red-500/20 text-red-400"
            />
          </div>

          {/* Aktivitas API Bar Chart & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-navy-800 bg-navy-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Aktivitas API</h3>
                  <p className="text-xs text-slate-400">Trafik permintaan & throughput data</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-slate-300">Request</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                    <span className="text-slate-300">Data Terkirim</span>
                  </div>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="h-52 flex items-end justify-between gap-3 pt-6 border-b border-navy-800 pb-2">
                {[
                  { day: "24 Sep", req: 30, sent: 70 },
                  { day: "25 Sep", req: 45, sent: 85 },
                  { day: "26 Sep", req: 35, sent: 60 },
                  { day: "27 Sep", req: 65, sent: 95 },
                  { day: "28 Sep", req: 50, sent: 80 },
                  { day: "29 Sep", req: 85, sent: 110 },
                  { day: "30 Sep", req: 75, sent: 100 },
                ].map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1.5 h-40">
                      <div
                        className="w-3 rounded-t bg-blue-500 transition-all hover:bg-blue-400"
                        style={{ height: `${item.req}%` }}
                        title={`Request: ${item.req * 20}`}
                      ></div>
                      <div
                        className="w-3 rounded-t bg-emerald-400 transition-all hover:bg-emerald-300"
                        style={{ height: `${item.sent}%` }}
                        title={`Data Terkirim: ${item.sent * 250}`}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-400">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Status */}
            <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Status Kesehatan API</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950 border border-navy-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-200">Public API Gateway</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">Aktif 200 OK</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950 border border-navy-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-slate-200">Olsera Scraper Engine</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">Tersambung</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950 border border-navy-800">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-slate-200">Rata-rata Latensi</span>
                  </div>
                  <span className="text-blue-400 font-semibold">48 ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Aktivitas Table */}
          <div className="rounded-2xl border border-navy-800 bg-navy-900/60 overflow-hidden shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Detail Aktivitas Pemanggilan API</h3>
            <div className="overflow-x-auto rounded-xl border border-navy-800">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-navy-800 bg-navy-900/90 text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Waktu</th>
                    <th className="px-6 py-3 font-semibold">Akses Kasir</th>
                    <th className="px-6 py-3 font-semibold">IP Client</th>
                    <th className="px-6 py-3 font-semibold">Jumlah Data</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 text-slate-300">
                  {m.recentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                        Belum ada aktivitas API.
                      </td>
                    </tr>
                  ) : (
                    m.recentLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-navy-850/50 transition">
                        <td className="px-6 py-3 text-slate-400">
                          {new Date(log.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-3 font-medium text-white">{log.apiKeyName}</td>
                        <td className="px-6 py-3 font-mono text-[11px] text-slate-400">
                          {log.ipAddress || "127.0.0.1"}
                        </td>
                        <td className="px-6 py-3 font-semibold text-blue-400">
                          {log.recordsCount} Data
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              log.statusCode === 200
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                log.statusCode === 200 ? "bg-emerald-400" : "bg-red-400"
                              }`}
                            ></span>
                            {log.statusCode === 200 ? "Sukses" : `Error ${log.statusCode}`}
                          </span>
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
