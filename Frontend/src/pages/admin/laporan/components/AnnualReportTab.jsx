import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE, CURRENT_YEAR, MONTHS, authHeaders, formatCurrency, formatDate, handleExportAnnualExcel, handleExportAnnualPdf } from "../helpers";
import { StatCard, ErrorBanner, TabLoading, YearSelect } from "./SharedComponents";

export default function AnnualReportTab() {
  const [tahun, setTahun] = useState(CURRENT_YEAR);
  const [data, setData] = useState({ bulanan: [], total_pemasukan: 0, total_pengeluaran: 0, saldo_akhir: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/dashboard/keuangan/tahunan`, { ...authHeaders(), params: { tahun } });
      setData(res.data?.data || { bulanan: [], total_pemasukan: 0, total_pengeluaran: 0, saldo_akhir: 0 });
    } catch (err) {
      console.error("Annual report load failed", err);
      setError("Gagal memuat laporan tahunan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tahun]);

  const bulanan = data.bulanan?.length ? data.bulanan : MONTHS.map((label, i) => ({ bulan: i + 1, label, pemasukan: 0, pengeluaran: 0, saldo: 0 }));

  const handleExportExcelLocal = () => {
    handleExportAnnualExcel(bulanan, data, tahun);
  };

  const handleExportPdfLocal = () => {
    handleExportAnnualPdf(bulanan, data, tahun);
  };

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between no-print">
        <div>
          <h3 className="font-semibold text-[15px]">Laporan Keuangan Tahunan</h3>
          <p className="text-xs text-base-content/40">Rekap 12 bulan, siap cetak untuk laporan ke sponsor/pengurus</p>
        </div>
        <div className="flex items-center gap-2">
          <YearSelect value={tahun} onChange={setTahun} />
          <button onClick={handleExportPdfLocal} className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>📄 PDF</button>
          <button onClick={handleExportExcelLocal} className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>📊 Excel</button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      <div className="print-area rounded-2xl bg-base-200 border border-base-content/5 p-8">
        <div className="text-center mb-6 pb-6 border-b border-base-content/10">
          <h2 className="font-bold text-lg">Laporan Keuangan Tahunan</h2>
          <p className="text-sm text-base-content/50">Periode Januari — Desember {tahun}</p>
          <p className="text-[11px] text-base-content/30 mt-1">Dicetak pada {formatDate(new Date())}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Pemasukan" value={formatCurrency(data.total_pemasukan)} colorClass="text-emerald-500" />
          <StatCard label="Total Pengeluaran" value={formatCurrency(data.total_pengeluaran)} colorClass="text-rose-500" />
          <StatCard label="Saldo Akhir Tahun" value={formatCurrency(data.saldo_akhir)} colorClass="text-sky-500" />
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-base-300/30">
              {["Bulan", "Pemasukan", "Pengeluaran", "Saldo"].map((h) => (
                <th key={h} className="text-left py-2.5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-base-content/40 border-b border-base-content/10">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bulanan.map((b) => (
              <tr key={b.bulan} className="border-b border-base-content/5">
                <td className="py-2.5 px-4 font-medium">{b.label}</td>
                <td className="py-2.5 px-4 text-emerald-500">{formatCurrency(b.pemasukan)}</td>
                <td className="py-2.5 px-4 text-rose-500">{formatCurrency(b.pengeluaran)}</td>
                <td className="py-2.5 px-4 font-semibold">{formatCurrency(b.saldo)}</td>
              </tr>
            ))}
            <tr className="bg-base-300/30 font-bold">
              <td className="py-3 px-4">TOTAL</td>
              <td className="py-3 px-4 text-emerald-500">{formatCurrency(data.total_pemasukan)}</td>
              <td className="py-3 px-4 text-rose-500">{formatCurrency(data.total_pengeluaran)}</td>
              <td className="py-3 px-4">{formatCurrency(data.saldo_akhir)}</td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-8 mt-16 pt-6 text-sm text-base-content/60">
          <div className="text-center">
            <p>Ketua Panitia</p>
            <div className="h-16" />
            <p className="border-t border-base-content/20 pt-1 inline-block px-6">( ____________________ )</p>
          </div>
          <div className="text-center">
            <p>Bendahara</p>
            <div className="h-16" />
            <p className="border-t border-base-content/20 pt-1 inline-block px-6">( ____________________ )</p>
          </div>
        </div>
      </div>
    </div>
  );
}
