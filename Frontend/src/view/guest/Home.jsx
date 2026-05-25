import { useEffect, useState } from "react";

// ── ANIMATED COUNTER ─────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = "" }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let cur = 0;
    const step = Math.ceil(target / 40);
    const iv = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(cur);
      if (cur >= target) clearInterval(iv);
    }, 35);
    return () => clearInterval(iv);
  }, [target]);
  return (
    <>
      {val}
      {suffix}
    </>
  );
};

// ── EVENT CARDS DATA ──────────────────────────────────────────────────
// Mengisi mock data agar card muncul di layar
const events = [
  {
    title: "Glow In The Dark Futsal League 2026",
    venue: "Tiga Naga Futsal, Pekanbaru",
    tag: "LIGA UTAMA",
    start: "12 Juni 2026",
    prize: "Rp 15.000.000",
    filled: 12,
    total: 16,
    slotLabel: "Sisa 4 Slot!",
    slotColor: "#ff4800",
    blink: true,
    img: "https://images.unsplash.com/photo-1577223625856-74552272e293?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Pekanbaru Student Futsal Championship",
    venue: "Gajah Mada Futsal, Pekanbaru",
    tag: "PELAJAR / U-19",
    start: "20 Juni 2026",
    prize: "Rp 7.500.000",
    filled: 24,
    total: 24,
    slotLabel: "Slot Penuh",
    slotColor: "rgba(255,255,255,.3)",
    blink: false,
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
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
        borderRadius: 14,
        overflow: "hidden",
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
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform .5s ease",
            transform: hovered ? "scale(1.07)" : "scale(1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(13,18,32,1) 0%, transparent 60%)",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "rgba(255,72,0,.2)",
            border: "1px solid rgba(255,72,0,.35)",
            color: "#ff7300",
            fontSize: 10,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 5,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            backdropFilter: "blur(6px)",
          }}
        >
          {event.tag}
        </span>
      </div>
      <div style={{ padding: 18 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.35,
            marginBottom: 10,
          }}
        >
          {event.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "rgba(255,255,255,.4)",
            marginBottom: 14,
          }}
        >
          📍 {event.venue}
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          <div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,.3)",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                fontWeight: 700,
              }}
            >
              Mulai
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>
              {event.start}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,.3)",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                fontWeight: 700,
              }}
            >
              Hadiah
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#ffc300",
                marginTop: 2,
              }}
            >
              {event.prize}
            </div>
          </div>
        </div>
        <div
          style={{
            height: 3,
            background: "rgba(255,255,255,.06)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 2,
              background: "linear-gradient(90deg,#ff4800,#ff9500)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 5,
            fontSize: 10,
            color: "rgba(255,255,255,.3)",
          }}
        >
          <span>
            {event.filled}/{event.total} slot terisi
          </span>
          <span>{pct}%</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,.06)",
            paddingTop: 14,
            marginTop: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: ".12em",
                color: "rgba(255,255,255,.3)",
                fontWeight: 600,
              }}
            >
              Sisa Slot
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: event.slotColor,
                marginTop: 2,
                animation: event.blink ? "blink 1.2s infinite" : "none",
              }}
            >
              {event.slotLabel}
            </div>
          </div>
          <button
            style={{
              background: hovered ? "#ff4800" : "#fff",
              color: hovered ? "#fff" : "#0d1220",
              padding: "9px 18px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              transition: "all .2s",
              letterSpacing: ".04em",
            }}
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
  {
    rank: "01",
    name: "Riau Garuda FC",
    detail: "Kec. Tampan",
    wins: "12 M",
    pts: "36",
  },
  {
    rank: "02",
    name: "Lancang Kuning Squad",
    detail: "Kec. Marpoyan Damai",
    wins: "10 M",
    pts: "31",
  },
  {
    rank: "03",
    name: "Tuah Madani United",
    detail: "Kec. Tuah Madani",
    wins: "9 M",
    pts: "28",
  },
];

const rankColors = {
  "01": "#ffc300", // Gold
  "02": "#b5b5b5", // Silver
  "03": "#c97e3a", // Bronze
};

// ── MAIN HOME COMPONENT ───────────────────────────────────────────────
const Home = () => {
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
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          top: -100,
          left: -80,
          background:
            "radial-gradient(circle,rgba(255,72,0,.12),transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
          animation: "breathe 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          top: 300,
          right: -60,
          background:
            "radial-gradient(circle,rgba(0,120,255,.08),transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
          animation: "breathe 6s ease-in-out 3s infinite",
        }}
      />

      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          background: "rgba(7,9,15,.7)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          position: "relative",
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 26,
            letterSpacing: ".1em",
          }}
        >
          FUN<span style={{ color: "#ff4800" }}>FUTSAL</span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {["Beranda", "Event", "Jadwal", "Leaderboard", "Tentang"].map(
            (item) => (
              <a
                key={item}
                style={{
                  color: "rgba(255,255,255,.6)",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                  letterSpacing: ".04em",
                }}
              >
                {item}
              </a>
            ),
          )}
        </div>
        <button
          style={{
            background: "#ff4800",
            color: "#fff",
            padding: "9px 22px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            letterSpacing: ".06em",
          }}
        >
          DAFTAR TIM
        </button>
      </nav>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          padding: "64px 32px 80px",
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(255,72,0,.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,120,255,.07) 0%, transparent 50%)",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,72,0,.1)",
            border: "1px solid rgba(255,72,0,.25)",
            color: "#ff7300",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".12em",
            padding: "6px 14px",
            borderRadius: 100,
            marginBottom: 22,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              background: "#ff4800",
              borderRadius: "50%",
              animation: "pulse 1.5s infinite",
              flexShrink: 0,
            }}
          />
          Platform Resmi Event Olahraga Pekanbaru
        </div>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(52px,7vw,80px)",
            lineHeight: 1,
            letterSpacing: ".04em",
            marginBottom: 18,
            maxWidth: 700,
          }}
        >
          PUSAT MANAJEMEN
          <br />
          <span style={{ color: "#ff4800", fontStyle: "italic" }}>
            EVENT FUN FUTSAL
          </span>
          <br />
          PEKANBARU
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,.5)",
            fontSize: 15,
            lineHeight: 1.7,
            maxWidth: 500,
            marginBottom: 32,
          }}
        >
          Kelola turnamen, daftarkan tim, dan pantau jadwal pertandingan secara
          profesional, transparan, dan real-time.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 56,
          }}
        >
          <button
            style={{
              background: "#ff4800",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              letterSpacing: ".06em",
              boxShadow: "0 0 30px rgba(255,72,0,.3)",
            }}
          >
            ⚡ LIHAT EVENT AKTIF
          </button>
          <button
            style={{
              background: "rgba(255,255,255,.05)",
              color: "rgba(255,255,255,.8)",
              padding: "14px 32px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,.1)",
              cursor: "pointer",
            }}
          >
            PELAJARI SELENGKAPNYA →
          </button>
        </div>

        {/* Stats (Diisi dengan nilai target agar Counter berjalan secara dinamis) */}
        <div
          style={{
            display: "flex",
            maxWidth: 640,
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 14,
            overflow: "hidden",
            background: "rgba(255,255,255,.025)",
          }}
        >
          {[
            { id: "teams", target: 48, label: "Tim Terdaftar" },
            { id: "events", target: 5, label: "Event Aktif" },
            {
              id: "matches",
              target: 120,
              label: "Pertandingan Selesai",
              orange: true,
            },
            { id: "venues", target: 8, label: "Venue Partner" },
          ].map((s, i, arr) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                padding: "18px 24px",
                textAlign: "center",
                borderRight:
                  i < arr.length - 1
                    ? "1px solid rgba(255,255,255,.07)"
                    : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 32,
                  letterSpacing: ".05em",
                  color: s.orange ? "#ff4800" : "#fff",
                }}
              >
                <AnimatedCounter target={s.target} />
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,.35)",
                  fontWeight: 600,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent)",
          margin: "0 32px",
        }}
      />

      {/* Live Match */}
      <section
        style={{ padding: "64px 32px", position: "relative", zIndex: 2 }}
      >
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
          <span
            style={{
              width: 7,
              height: 7,
              background: "#ff2222",
              borderRadius: "50%",
              animation: "pulse 1.2s infinite",
            }}
          />
          Pertandingan Terkini
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(28px,4vw,40px)",
            letterSpacing: ".04em",
            marginBottom: 28,
          }}
        >
          STATUS PERTANDINGAN
        </div>

        <div
          style={{
            background: "rgba(15,20,35,.85)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 16,
            padding: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 260,
            textAlign: "center",
            color: "rgba(255,255,255,.65)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 12,
                color: "#fff",
              }}
            >
              Tidak ada data pertandingan yang tersedia saat ini.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              Informasi live match akan otomatis muncul ketika ada jadwal atau
              skor terbaru.
            </p>
          </div>
        </div>
      </section>

      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent)",
          margin: "0 32px",
        }}
      />

      {/* Event Cards */}
      <section
        style={{ padding: "64px 32px", position: "relative", zIndex: 2 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
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
              ⚡ Segera Hadir
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(28px,4vw,40px)",
                letterSpacing: ".04em",
              }}
            >
              EVENT MENDATANG
            </div>
          </div>
          <button
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,.15)",
              color: "rgba(255,255,255,.6)",
              padding: "9px 18px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: ".04em",
            }}
          >
            LIHAT SEMUA →
          </button>
        </div>

        {/* Perbaikan Syntax Dilakukan Di Sini */}
        {events.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
              gap: 20,
            }}
          >
            {events.map((ev) => (
              <EventCard key={ev.title} event={ev} />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: 40,
              borderRadius: 18,
              background: "rgba(255,255,255,.02)",
              border: "1px solid rgba(255,255,255,.08)",
              textAlign: "center",
              color: "rgba(255,255,255,.6)",
            }}
          >
            Tidak ada event aktif untuk ditampilkan saat ini.
          </div>
        )}
      </section>

      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent)",
          margin: "0 32px",
        }}
      />

      {/* Leaderboard */}
      <section
        style={{ padding: "48px 32px 64px", position: "relative", zIndex: 2 }}
      >
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
          🏆 Klasemen
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(28px,4vw,40px)",
            letterSpacing: ".04em",
            marginBottom: 28,
          }}
        >
          LEADERBOARD LIGA GARUDA
        </div>
        <div
          style={{
            background: "rgba(13,18,32,.7)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid rgba(255,255,255,.06)",
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,255,255,.7)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Tim</span>
            <div style={{ display: "flex", gap: 28 }}>
              <span>M</span>
              <span>PTS</span>
            </div>
          </div>
          {leaderboard.length ? (
            leaderboard.map((row, i) => (
              <div
                key={row.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 24px",
                  borderBottom:
                    i < leaderboard.length - 1
                      ? "1px solid rgba(255,255,255,.04)"
                      : "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 18,
                    letterSpacing: ".05em",
                    width: 32,
                    color: rankColors[row.rank] || "rgba(255,255,255,.3)",
                  }}
                >
                  {row.rank}
                </div>
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    {row.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,.35)",
                      marginTop: 2,
                    }}
                  >
                    {row.detail}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#44cc88",
                    marginRight: 28,
                  }}
                >
                  {row.wins}
                </div>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 20,
                    letterSpacing: ".05em",
                  }}
                >
                  {row.pts}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "rgba(255,255,255,.6)",
              }}
            >
              Data leaderboard belum tersedia saat ini.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <div
        style={{
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,.05)",
          color: "rgba(255,255,255,.2)",
          fontSize: 11,
        }}
      >
        <span>© 2026 Fun Futsal Pekanbaru · Platform Resmi</span>
        <span>Dibuat dengan ❤ untuk komunitas futsal Riau</span>
      </div>
    </div>
  );
};

export default Home;
