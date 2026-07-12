import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE, authHeaders, formatCurrency } from "../helpers";
import { StatCard, ErrorBanner, TabLoading } from "./SharedComponents";

export default function ProjectionTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/dashboard/keuangan/tren`, { ...authHeaders(), params: { jumlah_bulan: 6 } });
      setHistory(res.data?.data || []);
    } catch (err) {
      console.error("Trend load failed", err);
      setError("Gagal memuat data tren untuk proyeksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const projection = useMemo(() => {
    if (!history.length) return { months: [], avgNet: 0, baseSaldo: 0 };
    const netChanges = history.map((h) => (h.pemasukan || 0) - (h.pengeluaran || 0));
    const avgNet = netChanges.reduce((a, b) => a + b, 0) / netChanges.length;
    const baseSaldo = history[history.length - 1]?.saldo ?? netChanges.reduce((a, b) => a + b, 0);
    const months = [1, 2, 3].map((n) => ({
      label: `+${n} bulan`,
      saldo: baseSaldo + avgNet * n,
    }));
    return { months, avgNet, baseSaldo };
  }, [history]);

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5">
      <div className="no-print">
        <h3 className="font-semibold text-[15px]">Proyeksi Cash Flow</h3>
        <p className="text-xs text-base-content/40">Estimasi saldo ke depan berdasarkan rata-rata arus kas {history.length || 0} bulan terakhir</p>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {!history.length && !error ? (
        <div className="rounded-2xl p-8 bg-base-200 border border-base-content/5 text-center text-sm text-base-content/40">
          Belum cukup data historis untuk membuat proyeksi. Minimal butuh riwayat transaksi 2-3 bulan.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Saldo Saat Ini" value={formatCurrency(projection.baseSaldo)} colorClass="text-sky-500" note="Titik awal proyeksi" />
            {projection.months.map((m) => (
              <StatCard
                key={m.label}
                label={`Estimasi ${m.label}`}
                value={formatCurrency(m.saldo)}
                colorClass={m.saldo >= projection.baseSaldo ? "text-emerald-500" : "text-rose-500"}
                note="Berdasarkan rata-rata arus kas"
              />
            ))}
          </div>

          <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5">
            <div className="mb-5">
              <h3 className="font-semibold text-[14px]">Riwayat &amp; Proyeksi Saldo</h3>
              <p className="text-xs text-base-content/40">Batang solid = aktual, batang pudar = estimasi</p>
            </div>
            {(() => {
              const allBars = [
                ...history.map((h) => ({ label: h.label, saldo: h.saldo, actual: true })),
                ...projection.months.map((m) => ({ label: m.label, saldo: m.saldo, actual: false })),
              ];
              const maxSaldo = Math.max(1, ...allBars.map((b) => Math.abs(b.saldo || 0)));
              return (
                <div className="flex items-end gap-3 h-48">
                  {allBars.map((b, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end min-w-0">
                      <div className="w-full flex items-end justify-center h-full">
                        <div
                          className={`w-4 rounded-t-md ${b.actual ? "bg-sky-500" : "bg-sky-300/50 border border-dashed border-sky-400"}`}
                          style={{ height: `${Math.max(2, (Math.abs(b.saldo || 0) / maxSaldo) * 100)}%` }}
                          title={formatCurrency(b.saldo)}
                        />
                      </div>
                      <span className="text-[10px] text-base-content/40 font-semibold text-center">{b.label}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
            <p className="text-[11px] text-base-content/40 mt-4 pt-4 border-t border-base-content/5">
              ⚠️ Proyeksi bersifat estimasi berdasarkan tren historis, bukan angka pasti. Gunakan sebagai referensi perencanaan, bukan keputusan final.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
