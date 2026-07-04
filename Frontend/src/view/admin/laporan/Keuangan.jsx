import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

const PAGE_SIZE = 8;
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3, CURRENT_YEAR - 4];

const emptyForm = {
  jenis: "pemasukan",
  kategori: "",
  nominal: "",
  metode_pembayaran: "Tunai",
  tanggal_transaksi: new Date().toISOString().slice(0, 10),
  keterangan: "",
};

// ---------- shared helpers ----------
const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);

const formatCurrencyShort = (value) => {
  const v = Number(value) || 0;
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
  return `${v}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return value;
  }
};

const downloadCsv = (filename, header, rows) => {
  const csv = [header, ...rows].map((r) => r.map((v) => `${v ?? ""}`.replace(/,/g, " ")).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

const TABS = [
  { key: "bulanan", label: "Ringkasan Bulanan" },
  { key: "perbandingan", label: "Perbandingan Tahun" },
  { key: "event", label: "Per Event" },
  { key: "proyeksi", label: "Proyeksi Kas" },
  { key: "tahunan", label: "Laporan Tahunan" },
  { key: "budget", label: "Budget vs Realisasi" },
];

// ---------- small building blocks ----------
function StatCard({ label, value, colorClass, note, noteClass }) {
  return (
    <div className="rounded-2xl p-5 bg-base-200 border border-base-content/5">
      <p className={`text-[11px] font-semibold uppercase tracking-[1.5px] ${colorClass}`}>{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-base-content leading-none">{value}</p>
      {note && <p className={`text-[11px] mt-1.5 ${noteClass || "text-base-content/40"}`}>{note}</p>}
    </div>
  );
}

function BarPair({ data, maxValue, labelKey = "label" }) {
  return (
    <div className="flex items-end gap-4 h-48">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end min-w-0">
          <div className="flex items-end gap-1.5 h-full w-full justify-center">
            <div
              className="w-3.5 rounded-t-md bg-emerald-400/80"
              style={{ height: `${Math.max(2, ((d.pemasukan || 0) / maxValue) * 100)}%` }}
              title={`Pemasukan: ${formatCurrency(d.pemasukan)}`}
            />
            <div
              className="w-3.5 rounded-t-md bg-rose-400/80"
              style={{ height: `${Math.max(2, ((d.pengeluaran || 0) / maxValue) * 100)}%` }}
              title={`Pengeluaran: ${formatCurrency(d.pengeluaran)}`}
            />
          </div>
          <span className="text-[10px] text-base-content/40 font-semibold truncate w-full text-center">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

function CategoryList({ title, subtitle, items, barClass }) {
  return (
    <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5">
      <div className="mb-5">
        <h3 className="font-semibold text-[14px]">{title}</h3>
        <p className="text-xs text-base-content/40">{subtitle}</p>
      </div>
      <div className="space-y-3.5">
        {items.length ? (
          items.map((c) => (
            <div key={c.kategori}>
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span className="font-medium text-base-content/70">{c.kategori}</span>
                <span className="text-base-content/40 font-semibold">{formatCurrencyShort(c.nominal)} · {c.pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-base-300/60 overflow-hidden">
                <div className={`h-full rounded-full ${barClass}`} style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-base-content/40 py-4 text-center">Belum ada data.</div>
        )}
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-xl px-4 py-3 text-sm bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-between">
      <span>{message}</span>
      {onRetry && <button onClick={onRetry} className="text-xs font-bold underline">Muat ulang</button>}
    </div>
  );
}

function TabLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-base-content/50">
      <span className="loading loading-spinner loading-md" />
      <p className="text-sm">Memuat data...</p>
    </div>
  );
}

function YearSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-[12px] rounded-xl px-3 py-2 bg-base-300/50 border border-base-content/10 outline-none font-semibold"
    >
      {YEAR_OPTIONS.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  );
}

// ==================================================================
// TAB 1 — Ringkasan Bulanan
// ==================================================================
function MonthlyTab({ onDataChanged }) {
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

  const handleExportCsv = () => {
    downloadCsv(
      `laporan-keuangan-${periode.tahun}-${String(periode.bulan).padStart(2, "0")}.csv`,
      ["Tanggal", "Jenis", "Kategori", "Metode Pembayaran", "Keterangan", "Nominal"],
      filteredTransactions.map((t) => [formatDate(t.tanggal_transaksi), t.jenis, t.kategori, t.metode_pembayaran || "-", t.keterangan || "", t.nominal])
    );
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
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>📄 PDF</button>
              <button onClick={handleExportCsv} className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>📊 Excel</button>
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

// ==================================================================
// TAB 2 — Perbandingan Tahun ke Tahun
// ==================================================================
function ComparisonTab() {
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

// ==================================================================
// TAB 3 — Breakdown per Event
// ==================================================================
function EventTab() {
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

// ==================================================================
// TAB 4 — Proyeksi Cash Flow
// ==================================================================
function ProjectionTab() {
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

// ==================================================================
// TAB 5 — Laporan Tahunan
// ==================================================================
function AnnualReportTab() {
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

  const handleExportCsv = () => {
    downloadCsv(
      `laporan-tahunan-${tahun}.csv`,
      ["Bulan", "Pemasukan", "Pengeluaran", "Saldo"],
      [...bulanan.map((b) => [b.label, b.pemasukan, b.pengeluaran, b.saldo]), ["TOTAL", data.total_pemasukan, data.total_pengeluaran, data.saldo_akhir]]
    );
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
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>📄 Cetak</button>
          <button onClick={handleExportCsv} className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>📊 Excel</button>
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

// ==================================================================
// TAB 6 — Budget vs Realisasi
// ==================================================================
function BudgetTab() {
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

// ==================================================================
// MAIN COMPONENT
// ==================================================================
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
      default: return <MonthlyTab />;
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