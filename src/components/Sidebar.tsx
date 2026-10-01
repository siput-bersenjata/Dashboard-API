"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KeyRound,
  Filter,
  Activity,
  Store,
  History,
  Settings,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Data API", href: "/data-api", icon: KeyRound },
  { name: "Preview Filter", href: "/data-api/preview", icon: Filter },
  { name: "Monitoring", href: "/monitoring", icon: Activity },
  { name: "Akses Kasir", href: "/kasir", icon: Store },
  { name: "Riwayat & Log", href: "/riwayat", icon: History },
  { name: "Pengaturan", href: "/pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-navy-800 bg-navy-950 p-4 flex flex-col justify-between">
      <div>
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30 text-white font-bold text-lg">
            KA
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Kasir API
            </h1>
            <p className="text-xs text-slate-400">Olsera Integration</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                    : "text-slate-400 hover:bg-navy-900 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Pill at the bottom */}
      <div className="rounded-2xl border border-navy-800 bg-navy-900/80 p-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">Sistem Aktif</div>
            <div className="text-[11px] text-slate-400">API siap digunakan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
