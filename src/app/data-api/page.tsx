"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  Edit,
  Eye,
  Percent,
  Sliders,
  X,
} from "lucide-react";
import Link from "next/link";

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  description: string | null;
  outlet: string | null;
  percentage: number;
  startDate: string | null;
  endDate: string | null;
  paymentModes: string | null;
  maxPerRequest: number;
  status: string;
  totalRequests: number;
  createdAt: string;
}

export default function DataApiPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ApiKeyItem | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formOutlet, setFormOutlet] = useState("Semua Kasir");
  const [formPercentage, setFormPercentage] = useState(100);
  const [formStartDate, setFormStartDate] = useState("2026-09-01");
  const [formEndDate, setFormEndDate] = useState("2026-09-30");
  const [formPaymentModes, setFormPaymentModes] = useState<string[]>([
    "Penjualan",
    "Pembayaran",
  ]);
  const [formMaxPerRequest, setFormMaxPerRequest] = useState(100);
  const [saving, setSaving] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/v1/keys");
      const json = await res.json();
      if (json.status === "success") {
        setKeys(json.data);
      }
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

  const handleOpenCreateModal = () => {
    setEditItem(null);
    setFormName("");
    setFormDescription("");
    setFormOutlet("Semua Kasir");
    setFormPercentage(100);
    setFormStartDate("2026-09-01");
    setFormEndDate("2026-09-30");
    setFormPaymentModes(["Penjualan", "Pembayaran"]);
    setFormMaxPerRequest(100);
    setShowModal(true);
  };

  const handleOpenEditModal = (item: ApiKeyItem) => {
    setEditItem(item);
    setFormName(item.name);
    setFormDescription(item.description || "");
    setFormOutlet(item.outlet || "Semua Kasir");
    setFormPercentage(item.percentage);
    setFormStartDate(item.startDate || "2026-09-01");
    setFormEndDate(item.endDate || "2026-09-30");
    try {
      setFormPaymentModes(item.paymentModes ? JSON.parse(item.paymentModes) : ["Penjualan"]);
    } catch (e) {
      setFormPaymentModes(["Penjualan"]);
    }
    setFormMaxPerRequest(item.maxPerRequest);
    setShowModal(true);
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSaving(true);
    try {
      if (editItem) {
        // Update
        await fetch("/api/v1/keys", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editItem.id,
            name: formName,
            description: formDescription,
            percentage: formPercentage,
            maxPerRequest: formMaxPerRequest,
          }),
        });
      } else {
        // Create
        await fetch("/api/v1/keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            description: formDescription,
            outlet: formOutlet,
            percentage: formPercentage,
            startDate: formStartDate,
            endDate: formEndDate,
            paymentModes: formPaymentModes,
            maxPerRequest: formMaxPerRequest,
          }),
        });
      }
      setShowModal(false);
      fetchKeys();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus API Key ini?")) return;
    try {
      await fetch(`/api/v1/keys?id=${id}`, { method: "DELETE" });
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const togglePaymentMode = (mode: string) => {
    if (formPaymentModes.includes(mode)) {
      setFormPaymentModes(formPaymentModes.filter((m) => m !== mode));
    } else {
      setFormPaymentModes([...formPaymentModes, mode]);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />

      <div className="flex-1 pl-64">
        <Header
          title="Data API"
          subtitle="Atur pengambilan data transaksi dari aplikasi kasir melalui API."
        />

        <main className="p-8 space-y-6">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-100">API Key Aktif</h3>
              <p className="text-xs text-slate-400">
                Kelola kunci API dan persentase filter transaksi kasir.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/data-api/preview"
                className="flex items-center gap-2 rounded-xl border border-navy-700 bg-navy-900 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-navy-800 hover:text-white"
              >
                <Eye className="h-4 w-4 text-emerald-400" />
                <span>Lihat Preview Filter</span>
              </Link>

              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
              >
                <Plus className="h-4 w-4" />
                <span>+ Buat API Key</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-navy-800 bg-navy-900/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-navy-800 bg-navy-900/90 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nama</th>
                    <th className="px-6 py-4 font-semibold">API Key</th>
                    <th className="px-6 py-4 font-semibold">Filter Persen</th>
                    <th className="px-6 py-4 font-semibold">Tanggal Dibuat</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 text-slate-300">
                  {keys.map((item) => {
                    const maskedKey = `${item.key.slice(0, 10)}...${item.key.slice(-4)}`;
                    const isCopied = copiedId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-navy-850/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{item.name}</div>
                          {item.description && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 rounded-lg bg-navy-950 px-2.5 py-1 font-mono text-[11px] text-slate-300 border border-navy-800">
                            <span>{maskedKey}</span>
                            <button
                              onClick={() => handleCopy(item.id, item.key)}
                              className="text-slate-400 hover:text-white transition"
                              title="Salin full API Key"
                            >
                              {isCopied ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400 border border-blue-500/20">
                            <Percent className="h-3 w-3" />
                            {item.percentage}% Transaksi
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              item.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.status === "active" ? "bg-emerald-400" : "bg-slate-400"
                              }`}
                            ></span>
                            {item.status === "active" ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/data-api/preview?keyId=${item.id}`}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-800 hover:text-emerald-400 transition"
                              title="Preview data filter"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-800 hover:text-blue-400 transition"
                              title="Edit konfigurasi"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKey(item.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-800 hover:text-red-400 transition"
                              title="Hapus API Key"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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

      {/* Modal Buat / Edit API Key (Matching Mockup 3) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-navy-800 bg-navy-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-navy-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editItem ? "Edit API Key" : "Buat / Edit API Key"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Atur nama akses dan filter transaksi untuk pengambilan data.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-5">
              {/* Bagian Informasi API Key */}
              <div>
                <h4 className="text-xs font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-blue-400" />
                  Informasi API Key
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Nama Akses <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kasir Utama, Kasir 2, Outlet 5, dll."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Deskripsi (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan deskripsi akses ini..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Slider Filter Persentase Data (Fitur Utama Request User) */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5" />
                    Persentase Filter Data Scrapping
                  </label>
                  <span className="rounded-lg bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                    {formPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={formPercentage}
                  onChange={(e) => setFormPercentage(Number(e.target.value))}
                  className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>10% (Sampel Minim)</span>
                  <span>50% (Separuh Data)</span>
                  <span>70%</span>
                  <span>100% (Semua Data)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Sistem menggunakan sampling deterministik konsisten berdasarkan nomor order transaksi.
                </p>
              </div>

              {/* Filter Transaksi */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-blue-400" />
                  Filter Transaksi
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Rentang Tanggal
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="rounded-xl border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="rounded-xl border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
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
                      value={formMaxPerRequest}
                      onChange={(e) => setFormMaxPerRequest(Number(e.target.value))}
                      className="w-full rounded-xl border border-navy-700 bg-navy-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Jumlah data maksimal yang akan ditarik per permintaan.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-2">
                    Jenis Transaksi
                  </label>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {["Penjualan", "Pembayaran", "Retur", "Lainnya"].map((mode) => {
                      const checked = formPaymentModes.includes(mode);
                      return (
                        <label
                          key={mode}
                          className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePaymentMode(mode)}
                            className="rounded border-navy-700 bg-navy-950 text-blue-600 focus:ring-0"
                          />
                          <span>{mode}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-navy-700 bg-navy-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-navy-800 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
