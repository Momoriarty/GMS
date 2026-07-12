import React, { useState } from "react";
import axios from "axios";
import { API_BASE, authHeaders, emptyForm, TABS } from "./helpers";
import MonthlyTab from "./components/MonthlyTab";
import ComparisonTab from "./components/ComparisonTab";
import EventTab from "./components/EventTab";
import ProjectionTab from "./components/ProjectionTab";
import AnnualReportTab from "./components/AnnualReportTab";
import BudgetTab from "./components/BudgetTab";
import QrisSettingsTab from "./components/QrisSettingsTab";

export default function Keuangan() {
  const [activeTab, setActiveTab] = useState("bulanan");
  const [reloadTick, setReloadTick] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const openModal = () => { setForm(emptyForm); setFormError(null); setModalOpen(true); };
  const handleFormChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    if (!form.kategori.trim() || !form.nominal) {
      setFormError("Kategori dan nominal wajib diisi.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await axios.post(`${API_BASE}/dashboard/keuangan/transaksi`, { ...form, nominal: Number(form.nominal) }, authHeaders());
      setModalOpen(false);
      setReloadTick((t) => t + 1);
    } catch (err) {
      console.error("Add transaction failed", err);
      setFormError("Gagal menyimpan transaksi. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case "perbandingan": return <ComparisonTab />;
      case "event": return <EventTab />;
      case "proyeksi": return <ProjectionTab />;
      case "tahunan": return <AnnualReportTab />;
      case "budget": return <BudgetTab />;
      case "qris": return <QrisSettingsTab />;
      default: return <MonthlyTab onDataChanged={() => setReloadTick(t => t + 1)} />;
    }
  };

  return (
    <div className="space-y-5 p-1 text-base-content print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg font-bold">Laporan Keuangan</h1>
          <p className="text-xs text-base-content/40 mt-0.5">Ringkasan, analisis, dan proyeksi keuangan organisasi.</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] rounded-xl font-bold active:scale-95 transition-all"
          style={{ background: "rgba(245,158,11,0.14)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}
        >
          + Transaksi
        </button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap no-print">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3.5 py-2 text-[12px] font-bold rounded-xl transition-all ${
              activeTab === t.key ? "bg-warning text-warning-content shadow-sm" : "bg-base-200 text-base-content/50 border border-base-content/10 hover:bg-base-300/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={`${activeTab}-${reloadTick}`}>{renderTab()}</div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 no-print" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-base-100 border border-base-content/10 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[15px]">Tambah Transaksi</h3>
              <button onClick={() => setModalOpen(false)} className="text-base-content/40 hover:text-base-content text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmitTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => handleFormChange("jenis", "pemasukan")} className={`py-2 rounded-xl text-[12px] font-bold border transition-all ${form.jenis === "pemasukan" ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : "border-base-content/10 text-base-content/50"}`}>Pemasukan</button>
                <button type="button" onClick={() => handleFormChange("jenis", "pengeluaran")} className={`py-2 rounded-xl text-[12px] font-bold border transition-all ${form.jenis === "pengeluaran" ? "bg-rose-500/15 text-rose-500 border-rose-500/30" : "border-base-content/10 text-base-content/50"}`}>Pengeluaran</button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-base-content/50">Kategori</label>
                <input type="text" value={form.kategori} onChange={(e) => handleFormChange("kategori", e.target.value)} placeholder="Misal: Sponsor, Konsumsi, Perlengkapan" className="mt-1 w-full text-sm rounded-xl px-3 py-2.5 bg-base-200 border border-base-content/10 outline-none focus:border-warning/50" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-base-content/50">Nominal (Rp)</label>
                  <input type="number" min="0" value={form.nominal} onChange={(e) => handleFormChange("nominal", e.target.value)} placeholder="0" className="mt-1 w-full text-sm rounded-xl px-3 py-2.5 bg-base-200 border border-base-content/10 outline-none focus:border-warning/50" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-base-content/50">Tanggal</label>
                  <input type="date" value={form.tanggal_transaksi} onChange={(e) => handleFormChange("tanggal_transaksi", e.target.value)} className="mt-1 w-full text-sm rounded-xl px-3 py-2.5 bg-base-200 border border-base-content/10 outline-none focus:border-warning/50" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-base-content/50">Metode Pembayaran</label>
                <select value={form.metode_pembayaran} onChange={(e) => handleFormChange("metode_pembayaran", e.target.value)} className="mt-1 w-full text-sm rounded-xl px-3 py-2.5 bg-base-200 border border-base-content/10 outline-none focus:border-warning/50">
                  <option value="Tunai">Tunai</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-base-content/50">Keterangan</label>
                <textarea value={form.keterangan} onChange={(e) => handleFormChange("keterangan", e.target.value)} rows={2} placeholder="Deskripsi singkat transaksi" className="mt-1 w-full text-sm rounded-xl px-3 py-2.5 bg-base-200 border border-base-content/10 outline-none focus:border-warning/50 resize-none" />
              </div>

              {formError && <p className="text-[12px] text-rose-500">{formError}</p>}

              <div className="flex items-center gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold border border-base-content/10 text-base-content/60 hover:bg-base-200 transition">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-warning-content bg-warning hover:brightness-95 transition disabled:opacity-50">
                  {submitting ? "Menyimpan..." : "Simpan Transaksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
