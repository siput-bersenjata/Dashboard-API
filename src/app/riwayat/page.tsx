"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { History, Filter, CheckCircle2, XCircle } from "lucide-react";

export default function RiwayatLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedKasir, setSelectedKasir] = useState("Semua Kasir");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.status === "success") {
          setLogs(json.monitoring.recentLogs || []);
        }
      });
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (selectedKasir !== "Semua Kasir" && l.apiKeyName !== selectedKasir) return false;
    if (selectedStatus === "Sukses" && l.statusCode !== 200) return false;
    if (selectedStatus === "Gagal" && l.statusCode === 200) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <div className="flex-1 pl-64">
        <Header
          title="Riwayat & Log"
          subtitle="Lihat riwayat permintaan data dan aktivitas API."
        />

        <main className="p-8 space-y-6">
          {/* Filter Bar matching mockup 6 */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-800 bg-navy-900/60 p-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-400 font-medium">Filter Log:</span>

              {/* Kasir filter */}
              <select
                value={selectedKasir}
                onChange={(e) => setSelectedKasir(e.target.value)}
                className="rounded-xl border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="Semua Kasir">Semua Kasir</option>
                <option value="Kasir Utama">Kasir Utama</option>
                <option value="Kasir 2 (Filter 70%)">Kasir 2</option>
                <option value="Kasir 3 (Filter 50%)">Kasir 3</option>
              </select>

              {/* Status filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Sukses">Sukses (200)</option>
                <option value="Gagal">Gagal / Error</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Total Log: <span className="font-semibold text-white">{filteredLogs.length}</span>
            </div>
          </div>

          {/* Table matching mockup 6 */}
          <div className="rounded-2xl border border-navy-800 bg-navy-900/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-navy-800 bg-navy-900/90 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Waktu</th>
                    <th className="px-6 py-4 font-semibold">Kasir</th>
                    <th className="px-6 py-4 font-semibold">Endpoint</th>
                    <th className="px-6 py-4 font-semibold">Jumlah Data</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 text-slate-300">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Tidak ada log yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-navy-850/50 transition">
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(log.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 font-medium text-white">{log.apiKeyName}</td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                          {log.endpoint}
                        </td>
                        <td className="px-6 py-4 font-semibold text-blue-400">
                          {log.recordsCount}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
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
                            {log.statusCode === 200 ? "Sukses" : "Gagal"}
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
