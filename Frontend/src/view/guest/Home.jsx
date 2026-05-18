import React, { useEffect, useRef, useState } from "react";

// ── NOTIFICATION SYSTEM ──────────────────────────────────────────────
const notifData = [
  { icon: "⚽", bg: "#ff2222", title: "GOL! Garuda FC memimpin!", msg: "Rafi Ananda mencetak gol menit ke-38. Skor kini 2-1!", color: "#ff2222" },
  { icon: "🏆", bg: "#ffc300", title: "Slot hampir habis!", msg: "Ramadhan Invitational 2025 hanya tersisa 1 slot lagi. Segera daftar!", color: "#ffc300" },
  { icon: "📢", bg: "#4488ff", title: "Jadwal diperbarui", msg: "Pertandingan Rajawali vs Phantom XI dipindah ke pukul 20:30 WIB.", color: "#4488ff" },
  { icon: "🔥", bg: "#ff7300", title: "Flash Sale aktif!", msg: "Hemat 20% biaya pendaftaran hari ini saja. Gunakan kode FUTSAL20.", color: "#ff7300" },
  { icon: "✅", bg: "#44cc88", title: "Tim berhasil didaftarkan", msg: "Storm XI resmi terdaftar di Liga Garuda Futsal Championship 2025.", color: "#44cc88" },
];

const NotifToast = ({ notif, onDismiss }) => {
  const [out, setOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setOut(true);
      setTimeout(onDismiss, 350);
    }, 5200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      style={{
        background: "rgba(15,20,35,.95)",
        border: "1px solid rgba(255,255,255,.1)",
        backdropFilter: "blur(20px)",
        borderRadius: 12,
        padding: "14px 16px",
        width: 300,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        position: "relative",
        overflow: "hidden",
        transition: "opacity .3s, transform .3s",
        opacity: out ? 0 : 1,
        transform: out ? "translateX(20px)" : "translateX(0)",
        animation: "slide-in .4s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      <div
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: notif.bg + "22",
          border: `1px solid ${notif.bg}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}
      >
        {notif.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{notif.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.55)", lineHeight: 1.5 }}>{notif.msg}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 5 }}>Baru saja</div>
      </div>
      <span
        onClick={() => { setOut(true); setTimeout(onDismiss, 350); }}
        style={{ fontSize: 18, color: "rgba(255,255,255,.3)", cursor: "pointer", lineHeight: 1, flexShrink: 0, paddingLeft: 4 }}
      >×</span>
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, height: 3, borderRadius: "0 0 0 12px",
          background: notif.color,
          animation: "drain 5s linear forwards",
        }}
      />
    </div>
  );
};

const NotifContainer = () => {
  const [toasts, setToasts] = useState([]);
  const indexRef = useRef(0);

  const push = () => {
    setToasts((prev) => {
      if (prev.length >= 3) return prev;
      const notif = notifData[indexRef.current % notifData.length];
      indexRef.current++;
      return [...prev, { id: Date.now(), notif }];
    });
  };

  useEffect(() => {
    const t1 = setTimeout(push, 2000);
    const iv = setInterval(push, 7000);
    return () => { clearTimeout(t1); clearInterval(iv); };
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div style={{ position: "fixed", top: 100, right: 24, zIndex: 999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map(({ id, notif }) => (
        <NotifToast key={id} notif={notif} onDismiss={() => dismiss(id)} />
      ))}
    </div>
  );
};

// ── LIVE TICKER ──────────────────────────────────────────────────────
const tickerItems = [
  "⚡ Garuda FC vs Elang United — BABAK 2 — LIVE — SKOR: 2 - 1",
  "🏆 Pendaftaran Liga Ramadhan dibuka hingga 30 Juli 2025",
  "🔥 Flash Sale Slot: Hemat 20% untuk tim yang daftar hari ini",
  "📍 Jadwal besok: 3 pertandingan di GOR Zidane pukul 15.00 - 21.00 WIB",
  "🥅 Top Skor Liga Garuda: Rafi Ananda — 7 gol dari 4 pertandingan",
];

const Ticker = () => (
  <div style={{ background: "linear-gradient(90deg,#ff4800,#ff7300,#ff4800)", backgroundSize: "200% 100%", padding: "8px 0", overflow: "hidden", position: "relative", zIndex: 20, animation: "ticker-bg 3s linear infinite" }}>
    <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", animation: "scroll-left 28s linear infinite" }}>
      {[...tickerItems, ...tickerItems].map((item, i) => (
        <React.Fragment key={i}>
          {i === 0 || i === tickerItems.length ? (
            <span style={{ background: "#fff", color: "#ff4800", fontSize: 10, fontWeight: 900, letterSpacing: ".15em", padding: "2px 8px", borderRadius: 3, marginRight: 16, flexShrink: 0 }}>● LIVE</span>
          ) : (
            <span style={{ display: "inline-block", width: 8, height: 8, background: "#fff", borderRadius: "50%", margin: "0 18px", opacity: .8 }} />
          )}
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".05em", color: "#fff" }}>{item}</span>
        </React.Fragment>
      ))}
    </div>
  </div>
);

// ── ANIMATED COUNTER ─────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = "" }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = Math.ceil(target / 40);
    const iv = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(cur);
      if (cur >= target) clearInterval(iv);
    }, 35);
    return () => clearInterval(iv);
  }, [target]);
  return <>{val}{suffix}</>;
};

// ── LIVE TIMER ────────────────────────────────────────────────────────
const LiveTimer = () => {
  const [secs, setSecs] = useState(38 * 60 + 24);
  useEffect(() => {
    const iv = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, []);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return <>{m}:{String(s).padStart(2, "0")} ⏱</>;
};

// ── EVENT CARDS DATA ──────────────────────────────────────────────────
const events = [
  {
    tag: "⚽ Futsal",
    title: "Liga Garuda Futsal Championship 2025",
    venue: "GOR Zidane Futsal, Pekanbaru",
    start: "20 Jul 2025",
    prize: "Rp 5 Juta",
    filled: 20, total: 25,
    slotColor: "#ff4444",
    slotLabel: "⚠ Sisa 5 Slot",
    img: "https://cdn0-production-images-kly.akamaized.net/I0hOVhWXhAKwlC0jCPgPGY4hDkg=/800x450/smart/filters:quality(75):strip_icc()/kly-media-production/medias/5489476/original/037355100_1769872866-1.jpg",
  },
  {
    tag: "🏆 Open",
    title: "Fun Futsal Cup — Pelajar Pekanbaru 2025",
    venue: "Arena Mega Sport, Pekanbaru",
    start: "5 Ags 2025",
    prize: "Rp 2 Juta",
    filled: 8, total: 20,
    slotColor: "#44cc88",
    slotLabel: "✓ 12 Slot Tersisa",
    img: "https://cdn0-production-images-kly.akamaized.net/I0hOVhWXhAKwlC0jCPgPGY4hDkg=/800x450/smart/filters:quality(75):strip_icc()/kly-media-production/medias/5489476/original/037355100_1769872866-1.jpg",
  },
  {
    tag: "🔥 Spesial",
    title: "Ramadhan Futsal Invitational 2025",
    venue: "GOR Mandiri, Pekanbaru",
    start: "30 Jul 2025",
    prize: "Rp 3.5 Juta",
    filled: 19, total: 20,
    slotColor: "#ff8800",
    slotLabel: "🔥 Sisa 1 Slot!",
    blink: true,
    img: "https://cdn0-production-images-kly.akamaized.net/I0hOVhWXhAKwlC0jCPgPGY4hDkg=/800x450/smart/filters:quality(75):strip_icc()/kly-media-production/medias/5489476/original/037355100_1769872866-1.jpg",
  },
];

const EventCard = ({ event }) => {
  const [hovered, setHovered] = useState(false);
  const pct = Math.round((event.filled / event.total) * 100);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(13,18,32,.9)",
        border: `1px solid ${hovered ? "rgba(255,72,0,.3)" : "rgba(255,255,255,.07)"}`,
        borderRadius: 14, overflow: "hidden",
        transition: "all .35s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? "0 20px 60px rgba(255,72,0,.1)" : "none",
        cursor: "pointer",
      }}
    >
      <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
        <img
          src={event.img}
          alt="poster"
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease", transform: hovered ? "scale(1.07)" : "scale(1)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,18,32,1) 0%, transparent 60%)" }} />
        <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,72,0,.2)", border: "1px solid rgba(255,72,0,.35)", color: "#ff7300", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 5, letterSpacing: ".08em", textTransform: "uppercase", backdropFilter: "blur(6px)" }}>
          {event.tag}
        </span>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.35, marginBottom: 10 }}>{event.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 14 }}>
          📍 {event.venue}
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700 }}>Mulai</div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{event.start}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700 }}>Hadiah</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#ffc300", marginTop: 2 }}>{event.prize}</div>
          </div>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: "linear-gradient(90deg,#ff4800,#ff9500)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 10, color: "rgba(255,255,255,.3)" }}>
          <span>{event.filled}/{event.total} slot terisi</span>
          <span>{pct}%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 14, marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".12em", color: "rgba(255,255,255,.3)", fontWeight: 600 }}>Sisa Slot</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: event.slotColor, marginTop: 2, animation: event.blink ? "blink 1.2s infinite" : "none" }}>
              {event.slotLabel}
            </div>
          </div>
          <button
            style={{ background: hovered ? "#ff4800" : "#fff", color: hovered ? "#fff" : "#0d1220", padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", transition: "all .2s", letterSpacing: ".04em" }}
          >
            DAFTAR
          </button>
        </div>
      </div>
    </div>
  );
};

// ── LEADERBOARD ───────────────────────────────────────────────────────
const leaderboard = [
  { rank: 1, name: "Garuda FC", detail: "Main 4 · Menang 3 · Kalah 1", wins: "3M", pts: 9 },
  { rank: 2, name: "Rajawali United", detail: "Main 4 · Menang 3 · Kalah 1", wins: "3M", pts: 9 },
  { rank: 3, name: "Titan FC", detail: "Main 4 · Menang 2 · Seri 1 · Kalah 1", wins: "2M", pts: 7 },
  { rank: 4, name: "Elang United", detail: "Main 4 · Menang 2 · Kalah 2", wins: "2M", pts: 6 },
  { rank: 5, name: "Phantom XI", detail: "Main 3 · Menang 1 · Kalah 2", wins: "1M", pts: 3 },
];
const rankColors = { 1: "#ffc300", 2: "#aaaaaa", 3: "#cd7f32" };

// ── MAIN HOME COMPONENT ───────────────────────────────────────────────
const Home = () => {
  return (
    <div style={{ background: "#07090f", color: "#fff", fontFamily: "'Outfit', sans-serif", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>
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

      {/* Notification toasts */}
      <NotifContainer />

      {/* Live Ticker */}
      <Ticker />

      {/* Navbar */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", background: "rgba(7,9,15,.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)", position: "relative", zIndex: 20 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: ".1em" }}>
          FUN<span style={{ color: "#ff4800" }}>FUTSAL</span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {["Beranda", "Event", "Jadwal", "Leaderboard", "Tentang"].map((item) => (
            <a key={item} style={{ color: "rgba(255,255,255,.6)", fontSize: 13, fontWeight: 600, textDecoration: "none", cursor: "pointer", letterSpacing: ".04em" }}>{item}</a>
          ))}
        </div>
        <button style={{ background: "#ff4800", color: "#fff", padding: "9px 22px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", letterSpacing: ".06em" }}>
          DAFTAR TIM
        </button>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", padding: "64px 32px 80px", background: "radial-gradient(ellipse at 20% 50%, rgba(255,72,0,.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,120,255,.07) 0%, transparent 50%)", zIndex: 2 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,72,0,.1)", border: "1px solid rgba(255,72,0,.25)", color: "#ff7300", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", padding: "6px 14px", borderRadius: 100, marginBottom: 22, textTransform: "uppercase" }}>
          <span style={{ width: 6, height: 6, background: "#ff4800", borderRadius: "50%", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
          Platform Resmi Event Olahraga Pekanbaru
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px,7vw,80px)", lineHeight: 1, letterSpacing: ".04em", marginBottom: 18, maxWidth: 700 }}>
          PUSAT MANAJEMEN<br />
          <span style={{ color: "#ff4800", fontStyle: "italic" }}>EVENT FUN FUTSAL</span><br />
          PEKANBARU
        </h1>
        <p style={{ color: "rgba(255,255,255,.5)", fontSize: 15, lineHeight: 1.7, maxWidth: 500, marginBottom: 32 }}>
          Kelola turnamen, daftarkan tim, dan pantau jadwal pertandingan secara profesional, transparan, dan real-time.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
          <button style={{ background: "#ff4800", color: "#fff", padding: "14px 32px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", letterSpacing: ".06em", boxShadow: "0 0 30px rgba(255,72,0,.3)" }}>
            ⚡ LIHAT EVENT AKTIF
          </button>
          <button style={{ background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.8)", padding: "14px 32px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "1px solid rgba(255,255,255,.1)", cursor: "pointer" }}>
            PELAJARI SELENGKAPNYA →
          </button>
        </div>
        {/* Stats */}
        <div style={{ display: "flex", maxWidth: 640, border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,.025)" }}>
          {[
            { id: "teams", target: 87, label: "Tim Terdaftar" },
            { id: "events", target: 3, label: "Event Aktif" },
            { id: "matches", target: 124, label: "Pertandingan Selesai", orange: true },
            { id: "venues", target: 5, label: "Venue Partner" },
          ].map((s, i, arr) => (
            <div key={s.id} style={{ flex: 1, padding: "18px 24px", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: ".05em", color: s.orange ? "#ff4800" : "#fff" }}>
                <AnimatedCounter target={s.target} />
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent)", margin: "0 32px" }} />

      {/* Live Match */}
      <section style={{ padding: "64px 32px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#ff7300", marginBottom: 10 }}>
          <span style={{ width: 7, height: 7, background: "#ff2222", borderRadius: "50%", animation: "pulse 1.2s infinite" }} />
          Sedang Berlangsung
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px,4vw,40px)", letterSpacing: ".04em", marginBottom: 28 }}>LIVE PERTANDINGAN</div>

        <div style={{ background: "linear-gradient(135deg, rgba(255,72,0,.12) 0%, rgba(15,20,35,.9) 50%), rgba(15,20,35,.85)", border: "1px solid rgba(255,72,0,.25)", borderRadius: 16, padding: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, position: "relative", overflow: "hidden", marginBottom: 28, boxShadow: "0 0 40px rgba(255,72,0,.08)" }}>
          <div style={{ content: "", position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#ff4800,#ff9500,#ff4800)", backgroundSize: "200% 100%", animation: "ticker-bg 2s linear infinite" }} />

          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: ".06em" }}>GARUDA FC</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 3 }}>Grup A</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ background: "#ff2222", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 5, letterSpacing: ".12em", animation: "blink 1s infinite" }}>● LIVE</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, letterSpacing: ".05em", lineHeight: 1, color: "#ff4800" }}>2</span>
              <span style={{ color: "rgba(255,255,255,.25)", fontSize: 28 }}>—</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, letterSpacing: ".05em", lineHeight: 1 }}>1</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 4 }}><LiveTimer /></div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 8 }}>📍 GOR Zidane Futsal, Pekanbaru</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: ".06em" }}>ELANG UNITED</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 3 }}>Grup A</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { time: "Berikutnya · 20:00 WIB", home: "RAJAWALI FC", away: "PHANTOM XI" },
            { time: "Besok · 15:30 WIB", home: "TITAN FC", away: "STORM XI" },
          ].map((m) => (
            <div key={m.time} style={{ flex: 1, minWidth: 220, background: "rgba(13,18,32,.7)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 10 }}>{m.time}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: ".06em" }}>{m.home}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>VS</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: ".06em" }}>{m.away}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent)", margin: "0 32px" }} />

      {/* Event Cards */}
      <section style={{ padding: "64px 32px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#ff7300", marginBottom: 10 }}>⚡ Segera Hadir</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px,4vw,40px)", letterSpacing: ".04em" }}>EVENT MENDATANG</div>
          </div>
          <button style={{ background: "transparent", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.6)", padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", letterSpacing: ".04em" }}>
            LIHAT SEMUA →
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 20 }}>
          {events.map((ev) => <EventCard key={ev.title} event={ev} />)}
        </div>
      </section>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent)", margin: "0 32px" }} />

      {/* Leaderboard */}
      <section style={{ padding: "48px 32px 64px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#ff7300", marginBottom: 10 }}>🏆 Klasemen</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px,4vw,40px)", letterSpacing: ".04em", marginBottom: 28 }}>LEADERBOARD LIGA GARUDA</div>
        <div style={{ background: "rgba(13,18,32,.7)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.7)", display: "flex", justifyContent: "space-between" }}>
            <span>Tim</span>
            <div style={{ display: "flex", gap: 28 }}><span>M</span><span>PTS</span></div>
          </div>
          {leaderboard.map((row, i) => (
            <div key={row.name} style={{ display: "flex", alignItems: "center", padding: "14px 24px", borderBottom: i < leaderboard.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none", cursor: "pointer" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: ".05em", width: 32, color: rankColors[row.rank] || "rgba(255,255,255,.3)" }}>{row.rank}</div>
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{row.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{row.detail}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#44cc88", marginRight: 28 }}>{row.wins}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: ".05em" }}>{row.pts}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div style={{ padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,.05)", color: "rgba(255,255,255,.2)", fontSize: 11 }}>
        <span>© 2025 Fun Futsal Pekanbaru · Platform Resmi</span>
        <span>Dibuat dengan ❤ untuk komunitas futsal Riau</span>
      </div>
    </div>
  );
};

export default Home;