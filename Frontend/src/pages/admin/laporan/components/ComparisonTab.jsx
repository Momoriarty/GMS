import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE, CURRENT_YEAR, MONTHS_SHORT, authHeaders, formatCurrency } from "../helpers";
import { StatCard, ErrorBanner, TabLoading, YearSelect } from "./SharedComponents";

export default function ComparisonTab() {
  const [tahun, setTahun] = useState(CURRENT_YEAR);
  const [data, setData] = useState({ bulanan: [], total_tahun_ini: 0, total_tahun_lalu: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/dashboard/keuangan/perbandingan`, { ...authHeaders(), params: { tahun } });
      setData(res.data?.data || { bulanan: [], total_tahun_ini: 0, total_tahun_lalu: 0 });
    } catch (err) {
      console.error("Comparison load failed", err);
      setError("Gagal memuat data perbandingan tahun.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tahun]);

  const bulanan = data.bulanan?.length ? data.bulanan : MONTHS_SHORT.map((label) => ({ label, tahun_ini: 0, tahun_lalu: 0 }));
  const maxValue = Math.max(1, ...bulanan.flatMap((d) => [d.tahun_ini || 0, d.tahun_lalu || 0]));
  const totalIni = data.total_tahun_ini ?? bulanan.reduce((a, b) => a + (b.tahun_ini || 0), 0);
  const totalLalu = data.total_tahun_lalu ?? bulanan.reduce((a, b) => a + (b.tahun_lalu || 0), 0);
  const growth = totalLalu ? ((totalIni - totalLalu) / Math.abs(totalLalu)) * 100 : null;

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between no-print">
        <div>
          <h3 className="font-semibold text-[15px]">Perbandingan Tahun ke Tahun</h3>
          <p className="text-xs text-base-content/40">Bandingkan total saldo tahun berjalan dengan tahun sebelumnya</p>
        </div>
        <YearSelect value={tahun} onChange={setTahun} />
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      <div className="grid grid-cols-3 gap-4">
        <StatCard label={`Saldo ${tahun}`} value={formatCurrency(totalIni)} colorClass="text-sky-500" note="Tahun berjalan" />
        <StatCard label={`Saldo ${tahun - 1}`} value={formatCurrency(totalLalu)} colorClass="text-base-content/50" note="Tahun sebelumnya" />
        <StatCard
          label="Pertumbuhan"
          value={growth != null ? `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%` : "-"}
          colorClass={growth == null ? "text-base-content/50" : growth >= 0 ? "text-emerald-500" : "text-rose-500"}
          note={`${tahun} vs ${tahun - 1}`}
        />
      </div>

      <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5">
        <div className="mb-5">
          <h3 className="font-semibold text-[14px]">Saldo per Bulan</h3>
          <p className="text-xs text-base-content/40">Batang gelap = {tahun}, batang terang = {tahun - 1}</p>
        </div>
        <div className="flex items-end gap-3 h-48">
          {bulanan.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end min-w-0">
              <div className="flex items-end gap-1.5 h-full w-full justify-center">
                <div className="w-3.5 rounded-t-md bg-sky-500" style={{ height: `${Math.max(2, ((d.tahun_ini || 0) / maxValue) * 100)}%` }} title={`${tahun}: ${formatCurrency(d.tahun_ini)}`} />
                <div className="w-3.5 rounded-t-md bg-sky-300/50" style={{ height: `${Math.max(2, ((d.tahun_lalu || 0) / maxValue) * 100)}%` }} title={`${tahun - 1}: ${formatCurrency(d.tahun_lalu)}`} />
              </div>
              <span className="text-[10px] text-base-content/40 font-semibold">{d.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-base-content/5">
          <div className="flex items-center gap-1.5 text-[11px] text-base-content/50"><span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> {tahun}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-base-content/50"><span className="w-2.5 h-2.5 rounded-sm bg-sky-300/50" /> {tahun - 1}</div>
        </div>
      </div>
    </div>
  );
}
