import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE, CURRENT_YEAR, authHeaders, formatCurrency } from "../helpers";
import { ErrorBanner, TabLoading, YearSelect } from "./SharedComponents";

export default function EventTab() {
  const [tahun, setTahun] = useState(CURRENT_YEAR);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/dashboard/keuangan/per-event`, { ...authHeaders(), params: { tahun } });
      setData(res.data?.data || []);
    } catch (err) {
      console.error("Event breakdown load failed", err);
      setError("Gagal memuat breakdown per event.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tahun]);

  const sorted = useMemo(() => [...data].sort((a, b) => (b.pemasukan - b.pengeluaran) - (a.pemasukan - a.pengeluaran)), [data]);
  const maxValue = Math.max(1, ...data.flatMap((e) => [e.pemasukan || 0, e.pengeluaran || 0]));

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between no-print">
        <div>
          <h3 className="font-semibold text-[15px]">Keuangan per Event</h3>
          <p className="text-xs text-base-content/40">Pemasukan dan pengeluaran dikelompokkan berdasarkan event/kompetisi</p>
        </div>
        <YearSelect value={tahun} onChange={setTahun} />
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      <div className="rounded-2xl overflow-hidden bg-base-200 border border-base-content/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-base-300/30">
              {["Event", "Pemasukan", "Pengeluaran", "Saldo Bersih", "Proporsi"].map((h) => (
                <th key={h} className="text-left py-3 px-5 text-[10px] font-extrabold uppercase tracking-widest text-base-content/40 border-b border-base-content/5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length ? (
              sorted.map((e) => {
                const saldo = (e.pemasukan || 0) - (e.pengeluaran || 0);
                return (
                  <tr key={e.event_id} className="border-b border-base-content/5 hover:bg-base-300/20 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-[13px]">{e.nama_event}</td>
                    <td className="py-3.5 px-5 text-emerald-500 font-semibold text-[13px]">{formatCurrency(e.pemasukan)}</td>
                    <td className="py-3.5 px-5 text-rose-500 font-semibold text-[13px]">{formatCurrency(e.pengeluaran)}</td>
                    <td className={`py-3.5 px-5 font-bold text-[13px] ${saldo >= 0 ? "text-base-content" : "text-rose-500"}`}>{formatCurrency(saldo)}</td>
                    <td className="py-3.5 px-5 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-base-300/60 overflow-hidden flex">
                          <div className="h-full bg-emerald-400" style={{ width: `${((e.pemasukan || 0) / maxValue) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={5} className="py-10 text-center text-sm text-base-content/40">Belum ada data keuangan per event untuk tahun {tahun}.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
