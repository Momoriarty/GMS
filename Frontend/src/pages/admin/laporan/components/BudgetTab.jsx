import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE, MONTHS, authHeaders, formatCurrency } from "../helpers";
import { StatCard, ErrorBanner, TabLoading, YearSelect } from "./SharedComponents";

export default function BudgetTab() {
  const today = new Date();
  const [periode, setPeriode] = useState({ bulan: today.getMonth() + 1, tahun: today.getFullYear() });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/dashboard/keuangan/budget`, { ...authHeaders(), params: periode });
      setData(res.data?.data || []);
    } catch (err) {
      console.error("Budget load failed", err);
      setError("Gagal memuat data budget vs realisasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode.bulan, periode.tahun]);

  const totalBudget = data.reduce((a, b) => a + (b.budget || 0), 0);
  const totalRealisasi = data.reduce((a, b) => a + (b.realisasi || 0), 0);

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between no-print">
        <div>
          <h3 className="font-semibold text-[15px]">Budget vs Realisasi</h3>
          <p className="text-xs text-base-content/40">Bandingkan anggaran yang ditetapkan dengan pengeluaran aktual per kategori</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={periode.bulan} onChange={(e) => setPeriode((p) => ({ ...p, bulan: Number(e.target.value) }))} className="text-[12px] rounded-xl px-3 py-2 bg-base-300/50 border border-base-content/10 outline-none font-semibold">
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <YearSelect value={periode.tahun} onChange={(y) => setPeriode((p) => ({ ...p, tahun: y }))} />
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Budget" value={formatCurrency(totalBudget)} colorClass="text-sky-500" />
        <StatCard label="Total Realisasi" value={formatCurrency(totalRealisasi)} colorClass="text-amber-500" />
        <StatCard
          label="Sisa Anggaran"
          value={formatCurrency(totalBudget - totalRealisasi)}
          colorClass={totalBudget - totalRealisasi >= 0 ? "text-emerald-500" : "text-rose-500"}
          note={totalBudget - totalRealisasi >= 0 ? "Masih dalam anggaran" : "Anggaran terlampaui"}
        />
      </div>

      <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5">
        <div className="space-y-4">
          {data.length ? (
            data.map((b) => {
              const pct = b.budget ? Math.min(150, (b.realisasi / b.budget) * 100) : 0;
              const over = b.realisasi > b.budget;
              return (
                <div key={b.kategori}>
                  <div className="flex items-center justify-between text-[13px] mb-1.5">
                    <span className="font-medium">{b.kategori}</span>
                    <span className={`font-semibold ${over ? "text-rose-500" : "text-base-content/60"}`}>
                      {formatCurrency(b.realisasi)} / {formatCurrency(b.budget)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-base-300/60 overflow-hidden">
                    <div className={`h-full rounded-full ${over ? "bg-rose-500" : "bg-emerald-400"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  {over && <p className="text-[11px] text-rose-500 mt-1">Melebihi budget {formatCurrency(b.realisasi - b.budget)}</p>}
                </div>
              );
            })
          ) : (
            <div className="text-sm text-base-content/40 text-center py-8">Belum ada anggaran yang ditetapkan untuk periode ini.</div>
          )}
        </div>
      </div>
    </div>
  );
}
