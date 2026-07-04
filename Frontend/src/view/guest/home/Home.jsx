import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LiveMatch from "./LiveMatch";
import EventCard from "./EventCard";
import Klasemen from "./Klasemen"; // 1. IMPORT KOMPONEN KLASEMEN DI SINI

// ── MAIN HOME COMPONENT ───────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();

  const [liveMatch, setLiveMatch] = useState(null);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [events, setEvents] = useState([]);

  const [stats, setStats] = useState({
    teams: 0,
    events: 0,
    matches: 0,
  });

  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [resStats, resEvents] = await Promise.all([
          fetch("http://localhost:8000/api/home/stats"),
          fetch("http://localhost:8000/api/home/events"),
        ]);

        const dataStats = await resStats.json();
        if (dataStats.success) setStats(dataStats.data);

        const dataEvents = await resEvents.json();
        if (dataEvents.success) setEvents(dataEvents.data);
      } catch (error) {
        console.error("Gagal memuat data statis:", error);
      }
    };

    const fetchLiveData = async () => {
      try {
        const [resLive, resUpcoming, resRecent] = await Promise.all([
          fetch("http://localhost:8000/api/jadwal/live-match"),
          fetch("http://localhost:8000/api/jadwal/upcoming-match"),
          fetch("http://localhost:8000/api/jadwal/recent-results"),
        ]);

        const dataLive = await resLive.json();
        if (dataLive.success) setLiveMatch(dataLive.data);

        const dataUpcoming = await resUpcoming.json();
        if (dataUpcoming.success) setUpcomingMatches(dataUpcoming.data);

        const dataRecent = await resRecent.json();
        if (dataRecent.success) setRecentResults(dataRecent.data);
      } catch (error) {
        console.error("Gagal memuat data live:", error);
      }
    };

    fetchStaticData();
    fetchLiveData();

    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: "#07090f",
        color: "#fff",
        fontFamily: "'Outfit', sans-serif",
        minHeight: "100vh",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700;900&display=swap');
        @keyframes ticker-bg { 0%{background-position:0%} 100%{background-position:200%} }
        @keyframes scroll-left { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes slide-in { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes drain { from{width:100%} to{width:0} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,72,0,.7)} 50%{box-shadow:0 0 0 6px rgba(255,72,0,0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes breathe { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.12)} }
      `}</style>

      {/* Glow orbs */}
      <div style={{ position: "absolute", width: 500, height: 500, top: -100, left: -80, background: "radial-gradient(circle,rgba(255,72,0,.12),transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0, animation: "breathe 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 400, height: 400, top: 300, right: -60, background: "radial-gradient(circle,rgba(0,120,255,.08),transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 0, animation: "breathe 6s ease-in-out 3s infinite" }} />

      {/* Hero Section */}
      <section style={{ position: "relative", padding: "64px 32px 80px", background: "radial-gradient(ellipse at 20% 50%, rgba(255,72,0,.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,120,255,.07) 0%, transparent 50%)", zIndex: 2 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,72,0,.1)", border: "1px solid rgba(255,72,0,.25)", color: "#ff7300", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", padding: "6px 14px", borderRadius: 100, marginBottom: 22, textTransform: "uppercase" }}>
          <span style={{ width: 6, height: 6, background: "#ff4800", borderRadius: "50%", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
          Platform Resmi Event Olahraga Pekanbaru
        </div>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px,7vw,80px)", lineHeight: 1, letterSpacing: ".04em", marginBottom: 18, maxWidth: 700 }}>
          PUSAT MANAJEMEN
          <br />
          <span style={{ color: "#ff4800", fontStyle: "italic" }}>EVENT FUN FUTSAL</span>
          <br />
          PEKANBARU
        </h1>

        <p style={{ color: "rgba(255,255,255,.5)", fontSize: 15, lineHeight: 1.7, maxWidth: 500, marginBottom: 32 }}>
          Kelola turnamen, daftarkan tim, dan pantau jadwal pertandingan secara profesional, transparan, dan real-time.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
          <button
            onClick={() => navigate("/events")}
            style={{ background: "#ff4800", color: "#fff", padding: "14px 32px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", letterSpacing: ".06em", boxShadow: "0 0 30px rgba(255,72,0,.3)" }}
          >
            ⚡ LIHAT EVENT AKTIF
          </button>
          <button style={{ background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.8)", padding: "14px 32px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "1px solid rgba(255,255,255,.1)", cursor: "pointer" }}>
            PELAJARI SELENGKAPNYA →
          </button>
        </div>

        {/* Stats Section — dari API */}
        <div style={{ display: "flex", maxWidth: 640, border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,.025)" }}>
          {[
            { id: "teams", value: stats.teams, label: "Tim Terdaftar" },
            { id: "events", value: stats.events, label: "Event Aktif" },
            { id: "matches", value: stats.matches, label: "Pertandingan Selesai", orange: true },
          ].map((s, i, arr) => (
            <div key={s.id} style={{ flex: 1, padding: "18px 24px", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: ".05em", color: s.orange ? "#ff4800" : "#fff" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent)", margin: "0 32px" }} />

      {/* Event Section */}
      <section id="events" style={{ padding: "56px 32px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#ff7300", marginBottom: 10 }}>
              ⚡ Segera Hadir
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px,4vw,40px)", letterSpacing: ".04em" }}>
              EVENT MENDATANG
            </div>
          </div>
          <button style={{ background: "transparent", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.6)", padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: ".04em" }}>
            LIHAT SEMUA →
          </button>
        </div>

        {events.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 20 }}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)", fontStyle: "italic" }}>
            Tidak ada event yang tersedia saat ini.
          </div>
        )}
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent)", margin: "0 32px" }} />

      {/* Live & Match Schedules Section */}
      <LiveMatch
        liveMatch={liveMatch}
        upcomingMatches={upcomingMatches}
        recentResults={recentResults}
      />
      
      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent)", margin: "0 32px" }} />

      {/* 2. TEMPAT KLASEMEN DILETAKKAN (Dibawah Jadwal Pertandingan) */}
      <div id="leaderboard">
        <Klasemen />
      </div>

      {/* Divider Akhir */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent)", margin: "0 32px" }} />

    </div>
  );
};

export default Home;