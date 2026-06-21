import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function AdminDashboard() {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:8000/api/dashboard/aktivitas",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setAuditLogs(response.data);
      } catch (error) {
        console.error("Gagal mengambil audit log:", error);
      }
    };

    fetchAuditLogs();
  }, []);
  const stats = [
    {
      label: "Total Event",
      value: "0",
      sub: "Data akan diperbarui",
      icon: "🏆",
      accent: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.2)",
    },
    {
      label: "Total Peserta",
      value: "0",
      sub: "Data akan diperbarui",
      icon: "👥",
      accent: "#3b82f6",
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.2)",
    },
    {
      label: "pending",
      value: "0",
      sub: "Aktivitas sistem",
      icon: "📋",
      accent: "#8b5cf6",
      bg: "rgba(139,92,246,0.12)",
      border: "rgba(139,92,246,0.2)",
    },
    {
      label: "Event Aktif",
      value: "0",
      sub: "Data akan diperbarui",
      icon: "▶",
      accent: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.2)",
    },
  ];

  const pendaftaran = [];

  const avatarGradients = [
    "from-amber-400 to-orange-500",
    "from-blue-400 to-blue-600",
    "from-violet-400 to-purple-600",
    "from-emerald-400 to-teal-600",
    "from-rose-400 to-pink-600",
    "from-cyan-400 to-blue-500",
  ];

  const chartData = [];
  const max = 220;
  console.log("AUDIT LOG:", auditLogs);
  return (
    <div className="space-y-5 p-1 text-base-content">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            onClick={() => {
              if (s.label === "Audit Log") {
                navigate("/admin/audit-log");
              }
            }}
            className="rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-200 cursor-pointer bg-base-200 border border-base-content/5"
          >
            <div
              className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity duration-300"
              style={{ background: s.accent }}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: s.bg, border: `1px solid ${s.border}` }}
                >
                  {s.icon}
                </div>
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: s.bg, color: s.accent }}
                >
                  {s.sub}
                </span>
              </div>
              <p className="text-[32px] font-extrabold text-base-content leading-none tracking-tight">
                {s.value}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[2px] mt-1.5 text-base-content/40">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-bold text-base-content text-[15px]">
              Statistik Peserta per Event
            </h2>
            <p className="text-xs mt-1 text-base-content/40">
              5 event terakhir yang diselenggarakan
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs px-4 py-2.5 rounded-xl bg-base-300/50 border border-base-content/5">
            <span className="flex items-center gap-2 font-medium text-base-content/70">
              <span
                className="w-3 h-3 rounded"
                style={{ background: "#f59e0b" }}
              />{" "}
              Futsal
            </span>
            <div className="w-px h-4 bg-base-content/10" />
            <span className="flex items-center gap-2 font-medium text-base-content/70">
              <span className="w-3 h-3 rounded bg-blue-400" /> SSB
            </span>
          </div>
        </div>

        <div
          className="flex items-center justify-center px-2"
          style={{ height: "200px" }}
        >
          {chartData && chartData.length ? (
            chartData.map((d, i) => {
              const val = d.futsal || d.ssb || 0;
              const h = max > 0 ? (val / max) * 100 : 0;
              const isFutsal = d.futsal > 0;

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2 group/bar"
                >
                  <span
                    className="text-[11px] font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity duration-150"
                    style={{ color: isFutsal ? "#f59e0b" : "#60a5fa" }}
                  >
                    {val}
                  </span>
                  <div
                    className="w-full flex items-end justify-center"
                    style={{ height: "152px" }}
                  >
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 group-hover/bar:brightness-110"
                      style={{
                        height: `${h}%`,
                        background: isFutsal
                          ? "linear-gradient(to top, #b45309, #f59e0b)"
                          : "linear-gradient(to top, #1d4ed8, #60a5fa)",
                        boxShadow: isFutsal
                          ? "0 0 16px rgba(245,158,11,0.25)"
                          : "0 0 16px rgba(96,165,250,0.25)",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-center leading-snug text-base-content/30">
                    {d.label}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center text-sm text-base-content/50">
              Statistik peserta belum tersedia.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5">
        <div className="mb-4">
          <h2 className="font-bold text-[15px]">Aktivitas Terbaru</h2>
          <p className="text-xs text-base-content/40">
            Riwayat aktivitas sistem terbaru
          </p>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-base-300/20 hover:bg-base-300/40 transition"
              >
                <div className="text-xl">
                  {log.aksi === "login" && ""}
                  {log.aksi === "logout" && ""}
                  {log.aksi === "create" && ""}
                  {log.aksi === "update" && ""}
                  {log.aksi === "delete" && ""}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {log.user?.name || "User"} melakukan <b>{log.aksi}</b> pada
                    tabel <b>{log.tabel}</b>
                  </p>

                  <p className="text-xs text-base-content/40 mt-1">
                    {new Date(log.tanggal).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-base-content/40 py-4">
              Belum ada aktivitas.
            </div>
          )}
        </div>
      </div>

      {/* Pendaftaran Terbaru */}
      <div className="rounded-2xl overflow-hidden bg-base-200 border border-base-content/5">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-content/5">
          <div>
            <h2 className="font-bold text-base-content text-[15px]">
              Pendaftaran Terbaru
            </h2>
            <p className="text-xs mt-0.5 text-base-content/40">
              Daftar pendaftaran yang masuk baru-baru ini
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-40">
                🔍
              </span>
              <input
                type="text"
                placeholder="Cari pendaftaran..."
                className="pl-8 pr-4 py-2 text-[12px] rounded-xl outline-none w-44 bg-base-300/50 border border-base-content/10 text-base-content placeholder-base-content/30 focus:border-warning/50 transition-all"
              />
            </div>
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all"
              style={{
                background: "rgba(245,158,11,0.12)",
                color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              📄 PDF
            </button>
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] rounded-xl font-bold active:scale-95 transition-all"
              style={{
                background: "rgba(16,185,129,0.12)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              📊 Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-base-300/30">
              {["Nama", "Tim", "Event", "Kategori", "Status", "Aksi"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-5 text-[10px] font-extrabold uppercase tracking-widest text-base-content/40 border-b border-base-content/5"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {pendaftaran.length ? (
              pendaftaran.map((p, i) => (
                <tr
                  key={i}
                  className="border-b border-base-content/5 hover:bg-base-300/20 transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-lg`}
                      >
                        {p.nama
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-[13px] text-base-content leading-tight">
                          {p.nama}
                        </p>
                        <p className="text-[11px] mt-0.5 text-base-content/40">
                          {p.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-[13px] font-medium text-base-content/70">
                      {p.tim}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 max-w-[190px]">
                    <span className="text-[12px] leading-snug line-clamp-2 text-base-content/60">
                      {p.event}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
                      style={
                        p.kategori === "Futsal"
                          ? {
                              background: "rgba(245,158,11,0.12)",
                              color: "#f59e0b",
                              border: "1px solid rgba(245,158,11,0.2)",
                            }
                          : {
                              background: "rgba(96,165,250,0.12)",
                              color: "#60a5fa",
                              border: "1px solid rgba(96,165,250,0.2)",
                            }
                      }
                    >
                      {p.kategori}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {p.status === "Approved" ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                        style={{
                          background: "rgba(16,185,129,0.12)",
                          color: "#10b981",
                          border: "1px solid rgba(16,185,129,0.2)",
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Approved
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                        style={{
                          background: "rgba(249,115,22,0.12)",
                          color: "#f97316",
                          border: "1px solid rgba(249,115,22,0.2)",
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    {p.status === "Pending" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          className="px-3 py-1.5 text-[11px] font-bold rounded-lg active:scale-95 transition-all"
                          style={{
                            background: "rgba(16,185,129,0.15)",
                            color: "#10b981",
                            border: "1px solid rgba(16,185,129,0.25)",
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="px-3 py-1.5 text-[11px] font-bold rounded-lg active:scale-95 transition-all"
                          style={{
                            background: "rgba(239,68,68,0.12)",
                            color: "#f87171",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
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
                <td
                  colSpan={6}
                  className="py-10 text-center text-sm text-base-content/40"
                >
                  Tidak ada pendaftaran terbaru.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-base-content/5 bg-base-300/10">
          <p className="text-xs text-base-content/40">
            Menampilkan{" "}
            <span className="text-base-content/70 font-semibold">6</span> dari{" "}
            <span className="text-base-content/70 font-semibold">15</span>{" "}
            pendaftaran
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg text-sm flex items-center justify-center border border-base-content/10 text-base-content/40">
              ‹
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`w-8 h-8 rounded-lg text-[12px] font-bold flex items-center justify-center transition-all ${
                  n === 1
                    ? "bg-warning text-warning-content shadow-sm"
                    : "border border-base-content/10 text-base-content/40"
                }`}
              >
                {n}
              </button>
            ))}
            <button className="w-8 h-8 rounded-lg text-sm flex items-center justify-center border border-base-content/10 text-base-content/40">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
