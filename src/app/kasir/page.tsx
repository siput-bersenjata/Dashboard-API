"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Store, Plus, Copy, Check, MoreVertical, X, ShieldCheck } from "lucide-react";

export default function AksesKasirPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formOutlet, setFormOutlet] = useState("Kasir 1 (Naiki Cafe Pusat)");
  const [formMax, setFormMax] = useState(100);
  const [formModes, setFormModes] = useState<string[]>(["Penjualan", "Pembayaran"]);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/v1/keys");
      const json = await res.json();
      if (json.status === "success") setKeys(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    await fetch("/api/v1/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formName,
        outlet: formOutlet,
        percentage: 100,
        maxPerRequest: formMax,
        paymentModes: formModes,
      }),
    });

    setShowModal(false);
    fetchKeys();
  };

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <div className="flex-1 pl-64">
        <Header
          title="Akses Kasir"
          subtitle="Kelola akses kasir yang dapat melakukan penarikan data."
        />

        <main className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Daftar Akses Kasir & Outlet</h3>
              <p className="text-xs text-slate-400">
                Hubungkan station kasir Olsera dengan kunci otorisasi penarikan API.
              </p>
            </div>

            <button
              onClick={() => {
                setFormName("");
                setShowModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
            >
              <Plus className="h-4 w-4" />
              <span>+ Tambah Akses</span>
            </button>
          </div>

          {/* Table matching mockup 5 */}
          <div className="rounded-2xl border border-navy-800 bg-navy-900/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-navy-800 bg-navy-900/90 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nama Akses</th>
                    <th className="px-6 py-4 font-semibold">Kasir / Outlet</th>
                    <th className="px-6 py-4 font-semibold">API Key</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Dibuat Pada</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 text-slate-300">
                  {keys.map((k, idx) => {
                    const outlets = [
                      "Kasir 1 (Naiki Cafe Pusat)",
                      "Kasir 2 (Station 635C)",
                      "Kasir 3 (Bar & Takeaway)",
                    ];
                    const outletName = k.outlet || outlets[idx % outlets.length];
                    const maskedKey = `${k.key.slice(0, 10)}...${k.key.slice(-4)}`;
                    const isCopied = copiedId === k.id;

                    return (
                      <tr key={k.id} className="hover:bg-navy-850/50 transition">
                        <td className="px-6 py-4 font-bold text-white">{k.name}</td>
                        <td className="px-6 py-4 text-slate-300">{outletName}</td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 rounded-lg bg-navy-950 px-2.5 py-1 font-mono text-[11px] text-slate-300 border border-navy-800">
                            <span>{maskedKey}</span>
                            <button
                              onClick={() => handleCopy(k.id, k.key)}
                              className="text-slate-400 hover:text-white"
                            >
                              {isCopied ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                            Aktif
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(k.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Tambah Akses Kasir */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-navy-800 bg-navy-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white">Tambah Akses Kasir</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nama Akses
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kasir 4"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Kasir / Outlet
                </label>
                <select
                  value={formOutlet}
                  onChange={(e) => setFormOutlet(e.target.value)}
                  className="w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Kasir 1 (Naiki Cafe Pusat)">Kasir 1 (Naiki Cafe Pusat)</option>
                  <option value="Kasir 2 (Station 635C)">Kasir 2 (Station 635C)</option>
                  <option value="Kasir 3 (Bar & Takeaway)">Kasir 3 (Bar & Takeaway)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Filter Transaksi
                </label>
                <div className="flex flex-wrap gap-4 text-xs">
                  {["Penjualan", "Pembayaran", "Retur", "Lainnya"].map((mode) => (
                    <label key={mode} className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={formModes.includes(mode)}
                        onChange={() => {
                          if (formModes.includes(mode)) {
                            setFormModes(formModes.filter((m) => m !== mode));
                          } else {
                            setFormModes([...formModes, mode]);
                          }
                        }}
                        className="rounded border-navy-700 bg-navy-950 text-blue-600 focus:ring-0"
                      />
                      <span>{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Maks. Data per Request
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formMax}
                  onChange={(e) => setFormMax(Number(e.target.value))}
                  className="w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-navy-700 bg-navy-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-navy-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
