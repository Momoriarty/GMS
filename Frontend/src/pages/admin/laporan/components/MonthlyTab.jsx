import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE, MONTHS, MONTHS_SHORT, PAGE_SIZE, authHeaders, formatCurrency, formatCurrencyShort, formatDate, handleExportExcel, handleExportPdf } from "../helpers";
import { StatCard, BarPair, CategoryList, ErrorBanner, TabLoading } from "./SharedComponents";

export default function MonthlyTab() {
  const today = new Date();
  const [periode, setPeriode] = useState({ bulan: today.getMonth() + 1, tahun: today.getFullYear() });
  const [summary, setSummary] = useState({ total_pemasukan: 0, total_pengeluaran: 0, saldo: 0, saldo_bulan_lalu: null });
  const [transactions, setTransactions] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("semua");
  const [kategoriFilter, setKategoriFilter] = useState("semua");
  const [page, setPage] = useState(1);

  const fetchFinance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/dashboard/keuangan`, {
        ...authHeaders(),
        params: { bulan: periode.bulan, tahun: periode.tahun },
      });
      const data = res.data?.data || {};
      setSummary(data.summary || { total_pemasukan: 0, total_pengeluaran: 0, saldo: 0, saldo_bulan_lalu: null });
      setTransactions(data.recent_transactions || []);
      setTrend(data.trend || []);
      setPage(1);
    } catch (err) {
      console.error("Finance load failed", err);
      setError("Gagal memuat laporan keuangan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode.bulan, periode.tahun]);

  const goToPrevMonth = () => setPeriode((p) => (p.bulan === 1 ? { bulan: 12, tahun: p.tahun - 1 } : { bulan: p.bulan - 1, tahun: p.tahun }));
  const goToNextMonth = () => setPeriode((p) => (p.bulan === 12 ? { bulan: 1, tahun: p.tahun + 1 } : { bulan: p.bulan + 1, tahun: p.tahun }));
  const isCurrentMonth = periode.bulan === today.getMonth() + 1 && periode.tahun === today.getFullYear();

  const netChange = summary.total_pemasukan - summary.total_pengeluaran;
  const growthPct =
    summary.saldo_bulan_lalu != null && summary.saldo_bulan_lalu !== 0
      ? ((summary.saldo - summary.saldo_bulan_lalu) / Math.abs(summary.saldo_bulan_lalu)) * 100
      : null;

  const kategoriOptions = useMemo(() => Array.from(new Set(transactions.map((t) => t.kategori).filter(Boolean))), [transactions]);

  const buildBreakdown = (jenis) => {
    const map = {};
    transactions.filter((t) => t.jenis === jenis).forEach((t) => {
      const key = t.kategori || "Lainnya";
      map[key] = (map[key] || 0) + Number(t.nominal || 0);
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map)
      .map(([kategori, nominal]) => ({ kategori, nominal, pct: total ? (nominal / total) * 100 : 0 }))
      .sort((a, b) => b.nominal - a.nominal)
      .slice(0, 6);
  };
  const pengeluaranBreakdown = useMemo(() => buildBreakdown("pengeluaran"), [transactions]);
  const pemasukanBreakdown = useMemo(() => buildBreakdown("pemasukan"), [transactions]);

  const chartData = useMemo(() => {
    if (trend.length) return trend;
    return [{ label: `${MONTHS_SHORT[periode.bulan - 1]} ${periode.tahun}`, pemasukan: summary.total_pemasukan, pengeluaran: summary.total_pengeluaran }];
  }, [trend, summary, periode]);
  const maxChartValue = useMemo(() => Math.max(1, ...chartData.flatMap((d) => [d.pemasukan || 0, d.pengeluaran || 0])), [chartData]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (jenisFilter !== "semua" && t.jenis !== jenisFilter) return false;
      if (kategoriFilter !== "semua" && t.kategori !== kategoriFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${t.keterangan || ""} ${t.kategori || ""} ${t.metode_pembayaran || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, jenisFilter, kategoriFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const paginatedTransactions = filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportExcelLocal = () => {
    handleExportExcel(filteredTransactions, `${MONTHS[periode.bulan - 1]} ${periode.tahun}`);
  };

  const handleExportPdfLocal = () => {
    handleExportPdf(filteredTransactions, summary, `${MONTHS[periode.bulan - 1]} ${periode.tahun}`);
  };

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-1 bg-base-200 border border-base-content/10 rounded-xl px-1.5 py-1.5">
          <button onClick={goToPrevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-base-300/60 transition">‹</button>
          <span className="text-[12px] font-semibold px-2 min-w-[130px] text-center">{MONTHS[periode.bulan - 1]} {periode.tahun}</span>
          <button onClick={goToNextMonth} disabled={isCurrentMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-base-300/60 transition disabled:opacity-30">›</button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchFinance} />}

      <div className="print-area space-y-5">
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Pemasukan" value={formatCurrency(summary.total_pemasukan)} colorClass="text-emerald-500" note={`Periode ${MONTHS[periode.bulan - 1]}`} />
          <StatCard label="Pengeluaran" value={formatCurrency(summary.total_pengeluaran)} colorClass="text-rose-500" note={`Periode ${MONTHS[periode.bulan - 1]}`} />
          <StatCard
            label="Saldo"
            value={formatCurrency(summary.saldo)}
            colorClass="text-sky-500"
            note={growthPct != null ? `${growthPct >= 0 ? "▲" : "▼"} ${Math.abs(growthPct).toFixed(1)}% vs bulan lalu` : "Total saldo saat ini"}
            noteClass={growthPct != null ? (growthPct >= 0 ? "text-emerald-500 font-semibold" : "text-rose-500 font-semibold") : undefined}
          />
          <StatCard
            label="Selisih Bersih"
            value={`${netChange >= 0 ? "+" : ""}${formatCurrency(netChange)}`}
            colorClass="text-amber-500"
            note="Pemasukan dikurangi pengeluaran"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 rounded-2xl p-6 bg-base-200 border border-base-content/5">
            <div className="mb-5">
              <h3 className="font-semibold text-[14px]">Tren Pemasukan &amp; Pengeluaran</h3>
              <p className="text-xs text-base-content/40">Perbandingan arus kas per periode</p>
            </div>
            <BarPair data={chartData} maxValue={maxChartValue} />
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-base-content/5">
              <div className="flex items-center gap-1.5 text-[11px] text-base-content/50"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/80" /> Pemasukan</div>
              <div className="flex items-center gap-1.5 text-[11px] text-base-content/50"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400/80" /> Pengeluaran</div>
            </div>
          </div>
          <CategoryList title="Kategori Pengeluaran" subtitle="Distribusi terbesar bulan ini" items={pengeluaranBreakdown} barClass="bg-amber-400" />
        </div>

        <div className="grid grid-cols-1">
          <CategoryList title="Kategori Pemasukan" subtitle="Sumber dana terbesar bulan ini (sponsor, pendaftaran, sumbangan, dll)" items={pemasukanBreakdown} barClass="bg-emerald-400" />
        </div>

        <div className="rounded-2xl overflow-hidden bg-base-200 border border-base-content/5">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-base-content/5 no-print">
            <div>
              <h3 className="font-semibold text-[15px]">Riwayat Transaksi</h3>
              <p className="text-xs text-base-content/40">Daftar transaksi keuangan pada periode ini</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-40">🔍</span>
                <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari transaksi..."
                  className="pl-8 pr-4 py-2 text-[12px] rounded-xl outline-none w-44 bg-base-300/50 border border-base-content/10 text-base-content placeholder-base-content/30 focus:border-warning/50 transition-all" />
              </div>
              <select value={jenisFilter} onChange={(e) => { setJenisFilter(e.target.value); setPage(1); }} className="text-[12px] rounded-xl px-3 py-2 bg-base-300/50 border border-base-content/10 outline-none">
                <option value="semua">Semua Jenis</option>
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
              <select value={kategoriFilter} onChange={(e) => { setKategoriFilter(e.target.value); setPage(1); }} className="text-[12px] rounded-xl px-3 py-2 bg-base-300/50 border border-base-content/10 outline-none">
                <option value="semua">Semua Kategori</option>
                {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <button onClick={handleExportPdfLocal} className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>📄 PDF</button>
              <button onClick={handleExportExcelLocal} className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>📊 Excel</button>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-base-300/30">
                {["Tanggal", "Keterangan", "Kategori", "Metode", "Jenis", "Nominal"].map((h) => (
                  <th key={h} className="text-left py-3 px-5 text-[10px] font-extrabold uppercase tracking-widest text-base-content/40 border-b border-base-content/5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length ? (
                paginatedTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-base-content/5 hover:bg-base-300/20 transition-colors">
                    <td className="py-3.5 px-5 text-[13px] text-base-content/70 whitespace-nowrap">{formatDate(t.tanggal_transaksi)}</td>
                    <td className="py-3.5 px-5"><span className="text-[13px] font-medium text-base-content">{t.keterangan || "-"}</span></td>
                    <td className="py-3.5 px-5"><span className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-base-300/50 text-base-content/60">{t.kategori || "-"}</span></td>
                    <td className="py-3.5 px-5 text-[13px] text-base-content/50">{t.metode_pembayaran || "-"}</td>
                    <td className="py-3.5 px-5">
                      {t.jenis === "pemasukan" ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Pemasukan</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.2)" }}><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Pengeluaran</span>
                      )}
                    </td>
                    <td className={`py-3.5 px-5 text-right font-semibold ${t.jenis === "pemasukan" ? "text-emerald-500" : "text-rose-500"}`}>{t.jenis === "pemasukan" ? "+" : "-"}{formatCurrency(t.nominal)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-base-content/40">Tidak ada transaksi yang cocok dengan filter ini.</td></tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-6 py-4 border-t border-base-content/5 bg-base-300/10 no-print">
            <p className="text-xs text-base-content/40">Menampilkan <span className="text-base-content/70 font-semibold">{paginatedTransactions.length}</span> dari <span className="text-base-content/70 font-semibold">{filteredTransactions.length}</span> transaksi</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg text-sm flex items-center justify-center border border-base-content/10 text-base-content/40 disabled:opacity-30">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-[12px] font-bold flex items-center justify-center transition-all ${n === page ? "bg-warning text-warning-content shadow-sm" : "border border-base-content/10 text-base-content/40"}`}>{n}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg text-sm flex items-center justify-center border border-base-content/10 text-base-content/40 disabled:opacity-30">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
