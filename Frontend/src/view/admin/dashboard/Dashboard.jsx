import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ events: 0, teams: 0, matches: 0 });
  const [events, setEvents] = useState([]);
  const [pendaftaran, setPendaftaran] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [results, setResults] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [finance, setFinance] = useState({ summary: { total_pemasukan: 0, total_pengeluaran: 0, saldo: 0 }, recent_transactions: [] });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { headers: { Authorization: `Bearer ${token}` } };

        const [statsRes, eventsRes, pendaftaranRes, upcomingRes, resultsRes, aktivitasRes, financeRes] = await Promise.all([
          axios.get(`${API_BASE}/home/stats`, headers),
          axios.get(`${API_BASE}/home/events`, headers),
          axios.get(`${API_BASE}/pendaftaran?status=menunggu`, headers),
          axios.get(`${API_BASE}/jadwal/upcoming-match`),
          axios.get(`${API_BASE}/jadwal/recent-results`),
          axios.get(`${API_BASE}/dashboard/aktivitas`, headers),
          axios.get(`${API_BASE}/dashboard/keuangan`, headers),
        ]);

        setStats(statsRes.data?.data || { events: 0, teams: 0, matches: 0 });
        setEvents(eventsRes.data?.data || []);
        setPendaftaran(pendaftaranRes.data?.data || []);
        setUpcoming(upcomingRes.data?.data || []);
        setResults(resultsRes.data?.data || []);
        setAuditLogs(aktivitasRes.data?.data || []);
        setFinance(financeRes.data?.data || { summary: { total_pemasukan: 0, total_pengeluaran: 0, saldo: 0 }, recent_transactions: [] });
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const statItems = [
    { label: "Event Aktif", value: stats.events ?? 0, icon: "🏆", accent: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.2)" },
    { label: "Total Peserta", value: stats.teams ?? 0, icon: "👥", accent: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.2)" },
    { label: "Pertandingan Selesai", value: stats.matches ?? 0, icon: "⚽", accent: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.2)" },
    { label: "Pendaftaran Pending", value: pendaftaran.length ?? 0, icon: "⏳", accent: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.2)" },
  ];

  const avatarGradients = [
    "from-amber-400 to-orange-500",
    "from-blue-400 to-blue-600",
    "from-violet-400 to-purple-600",
    "from-emerald-400 to-teal-600",
    "from-rose-400 to-pink-600",
    "from-cyan-400 to-blue-500",
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/pendaftaran/${id}/verify`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPendaftaran((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/pendaftaran/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPendaftaran((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-base-content/50 text-sm">
        Memuat dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-5 p-1 text-base-content">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statItems.map((s, i) => (
          <div key={i} className="rounded-2xl p-5 relative overflow-hidden bg-base-200 border border-base-content/5">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: s.accent }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  {s.icon}
                </div>
                <button
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: s.bg, color: s.accent }}
                  onClick={() => {
                    if (s.label === "Event Aktif") navigate("/admin/events");
                    if (s.label === "Pendaftaran Pending") navigate("/admin/pendaftaran");
                  }}
                >
                  Lihat
                </button>
              </div>
              <p className="text-[32px] font-extrabold text-base-content leading-none tracking-tight">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-[2px] mt-1.5 text-base-content/40">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Laporan Keuangan */}
      <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold">Laporan Keuangan</h3>
            <p className="text-xs text-base-content/40">Ringkasan pemasukan, pengeluaran, dan saldo</p>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate("/admin/keuangan")}>
            Lihat detail
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-emerald-500">Pemasukan</p>
            <p className="mt-1 text-lg font-bold text-base-content">{formatCurrency(finance.summary.total_pemasukan)}</p>
          </div>
          <div className="rounded-xl p-3 bg-rose-500/10 border border-rose-500/20">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-rose-500">Pengeluaran</p>
            <p className="mt-1 text-lg font-bold text-base-content">{formatCurrency(finance.summary.total_pengeluaran)}</p>
          </div>
          <div className="rounded-xl p-3 bg-sky-500/10 border border-sky-500/20">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-sky-500">Saldo</p>
            <p className="mt-1 text-lg font-bold text-base-content">{formatCurrency(finance.summary.saldo)}</p>
          </div>
        </div>

        <div className="space-y-3">
          {finance.recent_transactions.length ? (
            finance.recent_transactions.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-base-300/30 rounded-lg">
                <div>
                  <div className="font-medium">{item.keterangan || item.kategori}</div>
                  <div className="text-xs text-base-content/50">
                    {item.kategori} • {item.metode_pembayaran || "-"} • {item.tanggal_transaksi}
                  </div>
                </div>
                <div className={`text-sm font-semibold ${item.jenis === "pemasukan" ? "text-emerald-500" : "text-rose-500"}`}>
                  {item.jenis === "pemasukan" ? "+" : "-"}{formatCurrency(item.nominal)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-base-content/50">Belum ada data transaksi keuangan.</div>
          )}
        </div>
      </div>

      {/* Events / Matches */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold">Event Aktif</h3>
              <p className="text-xs text-base-content/40">Daftar event aktif</p>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate("/admin/events")}>
              Kelola
            </button>
          </div>

          <div className="space-y-3">
            {events.length ? (
              events.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-base-300/30 rounded-lg">
                  <div>
                    <div className="font-medium">{e.nama_event}</div>
                    <div className="text-xs text-base-content/50">{new Date(e.tanggal_mulai).toLocaleString("id-ID")}</div>
                  </div>
                  <div className="text-xs text-base-content/50">{e.pendaftaran_count ?? 0} peserta</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-base-content/50">Tidak ada event aktif.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold">Upcoming Matches</h3>
              <p className="text-xs text-base-content/40">Pertandingan mendatang</p>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate("/admin/jadwal")}>
              Lihat semua
            </button>
          </div>

          <div className="space-y-3">
            {upcoming.length ? (
              upcoming.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-base-300/30 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {m.tim_1_nama} vs {m.tim_2_nama}
                    </div>
                    <div className="text-xs text-base-content/50">
                      {m.event_nama} • {m.waktu}
                    </div>
                  </div>
                  <div className="text-xs text-base-content/50">{m.lokasi}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-base-content/50">Tidak ada pertandingan mendatang.</div>
            )}
          </div>
        </div>
      </div>

      {/* Aktivitas Terbaru */}
      <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5">
        <div className="mb-4">
          <h2 className="font-bold text-[15px]">Aktivitas Terbaru</h2>
          <p className="text-xs text-base-content/40">Riwayat aktivitas sistem terbaru</p>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {auditLogs.length ? (
            auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl bg-base-300/20 hover:bg-base-300/40 transition">
                <div className="w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center text-lg font-bold">
                  {log.user?.name
                    ? log.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                    : "U"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    <b>{log.user?.name || "User"}</b> melakukan <b>{log.aksi}</b> pada <b>{log.tabel}</b>
                  </p>
                  <p className="text-xs text-base-content/40 mt-1">{new Date(log.created_at).toLocaleString("id-ID")}</p>
                </div>
                <div className="text-xs text-base-content/40">{log.ip_address ?? ""}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-base-content/40 py-4">Belum ada aktivitas.</div>
          )}
        </div>
      </div>

      {/* Pendaftaran Terbaru */}
      <div className="rounded-2xl overflow-hidden bg-base-200 border border-base-content/5">
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-content/5">
          <div>
            <h2 className="font-bold text-base-content text-[15px]">Pendaftaran Terbaru</h2>
            <p className="text-xs mt-0.5 text-base-content/40">Daftar pendaftaran yang masuk baru-baru ini</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-40">🔍</span>
              <input
                type="text"
                placeholder="Cari pendaftaran..."
                className="pl-8 pr-4 py-2 text-[12px] rounded-xl outline-none w-44 bg-base-300/50 border border-base-content/10 text-base-content placeholder-base-content/30 focus:border-warning/50 transition-all"
              />
            </div>
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all"
              style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              📄 PDF
            </button>
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              📊 Excel
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-base-300/30">
              {["Nama", "Tim", "Event", "Kategori", "Status", "Aksi"].map((h) => (
                <th key={h} className="text-left py-3 px-5 text-[10px] font-extrabold uppercase tracking-widest text-base-content/40 border-b border-base-content/5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pendaftaran.length ? (
              pendaftaran.map((p, i) => (
                <tr key={p.id} className="border-b border-base-content/5 hover:bg-base-300/20 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-lg`}
                      >
                        {(p.user?.name || "User")
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-[13px] text-base-content leading-tight">{p.user?.name || "User"}</p>
                        <p className="text-[11px] mt-0.5 text-base-content/40">{p.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-[13px] font-medium text-base-content/70">{p.tim?.nama_tim}</span>
                  </td>
                  <td className="py-3.5 px-5 max-w-[190px]">
                    <span className="text-[12px] leading-snug line-clamp-2 text-base-content/60">{p.event?.nama_event}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
                      style={
                        p.tim?.kelompok_umur === "Futsal"
                          ? { background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }
                          : { background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }
                      }
                    >
                      {p.tim?.kelompok_umur || "-"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {p.status === "diterima" ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                        style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Diterima
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                        style={{ background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.2)" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                        {p.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    {p.status === "menunggu" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="px-3 py-1.5 text-[11px] font-bold rounded-lg active:scale-95 transition-all"
                          style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          className="px-3 py-1.5 text-[11px] font-bold rounded-lg active:scale-95 transition-all"
                          style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : (
                      <button className="px-3 py-1.5 text-[11px] font-bold rounded-lg active:scale-95 transition-all bg-base-300 text-base-content/70 border border-base-content/10 hover:bg-base-300/80">
                        Detail →
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-base-content/40">
                  Tidak ada pendaftaran terbaru.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-6 py-4 border-t border-base-content/5 bg-base-300/10">
          <p className="text-xs text-base-content/40">
            Menampilkan <span className="text-base-content/70 font-semibold">{Math.min(pendaftaran.length, 6)}</span> dari{" "}
            <span className="text-base-content/70 font-semibold">{pendaftaran.length}</span> pendaftaran
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg text-sm flex items-center justify-center border border-base-content/10 text-base-content/40">‹</button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`w-8 h-8 rounded-lg text-[12px] font-bold flex items-center justify-center transition-all ${
                  n === 1 ? "bg-warning text-warning-content shadow-sm" : "border border-base-content/10 text-base-content/40"
                }`}
              >
                {n}
              </button>
            ))}
            <button className="w-8 h-8 rounded-lg text-sm flex items-center justify-center border border-base-content/10 text-base-content/40">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}