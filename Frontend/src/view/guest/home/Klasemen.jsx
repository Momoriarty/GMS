import React from "react";

// Mock data untuk tim klasemen (bisa diganti lewat props nanti)
const mockTeams = [
  { rank: 1, name: "Garuda Esports", logo: "🦅", played: 10, points: 28 },
  { rank: 2, name: "Besta United", logo: "🦁", played: 10, points: 24 },
  { rank: 3, name: "Nusantara FC", logo: "🐅", played: 10, points: 21 },
  { rank: 4, name: "Siliwangi Gaming", logo: "🐉", played: 10, points: 18 },
  { rank: 5, name: "Majapahit Squad", logo: "🛡️", played: 10, points: 15 },
];

export default function Klasemen({ teams = mockTeams }) {
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
        🏆 Klasemen
      </div>

      {/* Title */}
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
          <div style={{ display: "flex", gap: 28, textAlign: "center", width: 90, justifyContent: "flex-end" }}>
            <span style={{ width: 30 }}>M</span>
            <span style={{ width: 30, color: "#ff7300" }}>PTS</span>
          </div>
        </div>

        {/* Table Body */}
        <div>
          {teams.map((team, index) => (
            <div
              key={team.id || index}
              style={{
                padding: "16px 24px",
                borderBottom: index !== teams.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                fontSize: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: index % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.01)",
              }}
            >
              {/* Kolom Informasi Tim (Peringkat, Logo, Nama) */}
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ 
                  width: 24, 
                  textAlign: "center", 
                  fontWeight: index < 3 ? 800 : 500,
                  color: index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "rgba(255,255,255,.5)" 
                }}>
                  {team.rank || index + 1}
                </span>
                <span style={{ fontSize: 18 }}>{team.logo || "🛡️"}</span>
                <span style={{ fontWeight: 600, color: "rgba(255,255,255,.9)" }}>{team.name}</span>
              </div>

              {/* Kolom Statistik (Match & Points) */}
              <div style={{ display: "flex", gap: 28, textAlign: "center", width: 90, justifyContent: "flex-end" }}>
                <span style={{ width: 30, color: "rgba(255,255,255,.6)" }}>{team.played}</span>
                <span style={{ width: 30, fontWeight: 700, color: "#fff" }}>{team.points}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}