"use client";

import { useState } from "react";
import { Bell, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onSyncComplete?: () => void;
}

export default function Header({ title, subtitle, onSyncComplete }: HeaderProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSyncOlsera = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/olsera/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxPages: 5 }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg({
          type: "success",
          text: data.message || `Sinkronisasi berhasil: ${data.totalIngested} transaksi.`,
        });
        if (onSyncComplete) onSyncComplete();
      } else {
        setSyncMsg({ type: "error", text: data.message || "Gagal sinkronisasi." });
      }
    } catch (e: any) {
      setSyncMsg({ type: "error", text: e.message || "Terjadi kesalahan jaringan." });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 5000);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-navy-800 bg-navy-950/80 backdrop-blur px-8">
      <div>
        {title && <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>}
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Sync notification message banner */}
        {syncMsg && (
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium ${
              syncMsg.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {syncMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{syncMsg.text}</span>
          </div>
        )}

        {/* Sync Button */}
        <button
          onClick={handleSyncOlsera}
          disabled={syncing}
          className="flex items-center gap-2 rounded-xl border border-navy-700 bg-navy-900 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-navy-800 hover:text-white disabled:opacity-50"
          title="Sinkronkan data transaksi terbaru langsung dari Olsera Backoffice"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-blue-400 ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "Menyinkronkan..." : "Tarik Data Olsera"}</span>
        </button>

        {/* Bell notification */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-navy-800 bg-navy-900/60 text-slate-400 hover:text-white transition">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-blue-500"></span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-navy-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-slate-200 font-semibold text-xs border border-navy-700">
            RD
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-200">Ronal Denian</div>
            <div className="text-[10px] text-slate-400 font-medium">Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
}
