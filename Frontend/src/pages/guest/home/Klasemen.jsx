import React, { useEffect, useState } from "react";
import api from "../../../data/api";

export default function Klasemen() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Dapatkan event yang sedang aktif berjalan (berdasarkan tanggal saat ini)
  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        setLoading(true);
        const res = await api.get("/home/events");
        const allEvents = res.data?.data || [];
        
        // Cari event yang statusnya 'aktif' dan hari ini berada di antara tanggal_mulai & tanggal_selesai
        const now = new Date();
        
        const runningEvent = allEvents.find(evt => {
          if (evt.status !== "aktif") return false;
          const start = new Date(evt.tanggal_mulai);
          const end = new Date(evt.tanggal_selesai);
          return now >= start && now <= end;
        }) || allEvents[0]; // fallback ke event terdekat jika tidak ada yang pas di tanggal hari ini

        setActiveEvent(runningEvent);

        if (runningEvent) {
          const standingsRes = await api.get(`/klasemen?event_id=${runningEvent.id}`);
          setStandings(standingsRes.data?.data || []);
        }
      } catch (err) {
        console.error("Gagal mengambil data klasemen:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvent();
  }, []);

  return (
    <section
      style={{ padding: "48px 32px 64px", position: "relative", zIndex: 2 }}
    >
      {/* Subtitle / Kategori */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "#ff7300",
          marginBottom: 10,
        }}
      >
        🏆 Klasemen Live
      </div>

      {/* Header Event Aktif (Otomatis) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(28px,4vw,40px)",
              letterSpacing: ".04em",
            }}
          >
            LEADERBOARD {activeEvent ? activeEvent.nama_event.toUpperCase() : "EVENT BERJALAN"}
          </div>
          {activeEvent && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              Event sedang berlangsung: {new Date(activeEvent.tanggal_mulai).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} s/d {new Date(activeEvent.tanggal_selesai).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {/* Container Tabel */}
      <div
        style={{
          background: "rgba(13,18,32,.7)",
          border: "1px solid rgba(255,255,255,.07)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid rgba(255,255,255,.06)",
            fontSize: 13,
            fontWeight: 700,
            color: "rgba(255,255,255,.7)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ width: 24, textAlign: "center" }}>#</span>
            <span>Tim</span>
          </div>
          <div style={{ display: "flex", gap: 20, textAlign: "center", width: 220, justifyContent: "flex-end" }}>
            <span style={{ width: 30 }}>M</span>
            <span style={{ width: 30 }}>S</span>
            <span style={{ width: 30 }}>K</span>
            <span style={{ width: 45 }}>Selisih</span>
            <span style={{ width: 30, color: "#ff7300" }}>PTS</span>
          </div>
        </div>

        {/* Table Body */}
        <div>
          {loading ? (
            <div style={{ padding: "40px", color: "rgba(255,255,255,.5)", fontSize: 13, textAlign: "center" }}>
              Memuat data klasemen...
            </div>
          ) : standings.length > 0 ? (
            standings.map((team, index) => (
              <div
                key={team.id || index}
                style={{
                  padding: "16px 24px",
                  borderBottom: index !== standings.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                  fontSize: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: index % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.01)",
                }}
              >
                {/* Kolom Informasi Tim */}
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ 
                    width: 24, 
                    textAlign: "center", 
                    fontWeight: index < 3 ? 800 : 500,
                    color: index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "rgba(255,255,255,.5)" 
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ fontSize: 18 }}>🛡️</span>
                  <span style={{ fontWeight: 600, color: "rgba(255,255,255,.9)" }}>{team.nama_tim}</span>
                </div>

                {/* Kolom Statistik */}
                <div style={{ display: "flex", gap: 20, textAlign: "center", width: 220, justifyContent: "flex-end" }}>
                  <span style={{ width: 30, color: "rgba(255,255,255,.6)" }}>{team.main || 0}</span>
                  <span style={{ width: 30, color: "rgba(255,255,255,.6)" }}>{team.seri || 0}</span>
                  <span style={{ width: 30, color: "rgba(255,255,255,.6)" }}>{team.kalah || 0}</span>
                  <span style={{ width: 45, color: (team.selisih_gol || 0) > 0 ? "#10b981" : (team.selisih_gol || 0) < 0 ? "#ef4444" : "rgba(255,255,255,.4)" }}>
                    {(team.selisih_gol || 0) > 0 ? `+${team.selisih_gol}` : team.selisih_gol || 0}
                  </span>
                  <span style={{ width: 30, fontWeight: 700, color: "#fff" }}>
                    {(team.menang || 0) * 3 + (team.seri || 0)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "40px", color: "rgba(255,255,255,.4)", fontSize: 13, textAlign: "center" }}>
              Belum ada data klasemen untuk event ini.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
