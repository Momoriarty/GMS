import React from "react";

const LiveMatch = ({ liveMatch, upcomingMatches = [], recentResults = [] }) => {
  return (
    <section style={{ padding: "56px 32px", position: "relative", zIndex: 2 }}>

      {/* Header */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#ff7300", marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, background: liveMatch ? "#ff2222" : "#ff9500", borderRadius: "50%", animation: "pulse 1.2s infinite", flexShrink: 0 }} />
        {liveMatch ? "Sedang Berlangsung" : "Jadwal Pertandingan"}
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(26px,3.5vw,36px)", letterSpacing: ".05em", marginBottom: 32, color: "#fff" }}>
        {liveMatch ? "LIVE PERTANDINGAN" : "PERTANDINGAN MENDATANG"}
      </div>

      {/* Live Match Box */}
      {liveMatch ? (
        <div style={{ position: "relative", background: "rgba(15,20,35,.95)", border: "1px solid rgba(255,72,0,.2)", borderRadius: 14, padding: "32px 28px", marginBottom: 40, overflow: "hidden" }}>
          {/* Top neon bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#ff4800,#ff9500,#ff4800)", backgroundSize: "200% 100%", animation: "ticker-bg 2s linear infinite" }} />

          {/* Event + LIVE badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
              {liveMatch.event_nama ? `🏆 ${liveMatch.event_nama}` : ""}
            </span>
            <span style={{ background: "#ff2222", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 4, letterSpacing: ".14em", animation: "blink 1s infinite" }}>● LIVE</span>
          </div>

          {/* Score row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(18px,2.5vw,26px)", letterSpacing: ".06em", color: "#fff" }}>
                {liveMatch.tim_1_nama || "-"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px,5vw,58px)", color: "#ff4800", lineHeight: 1 }}>
                {liveMatch.skor_tim_1 ?? 0}
              </span>
              <span style={{ color: "rgba(255,255,255,.15)", fontSize: 24, fontWeight: 300 }}>:</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px,5vw,58px)", color: "#fff", lineHeight: 1 }}>
                {liveMatch.skor_tim_2 ?? 0}
              </span>
            </div>

            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(18px,2.5vw,26px)", letterSpacing: ".06em", color: "#fff" }}>
                {liveMatch.tim_2_nama || "-"}
              </div>
            </div>
          </div>

          {/* Lokasi */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.05)", fontSize: 11, color: "rgba(255,255,255,.25)", letterSpacing: ".02em" }}>
            📍 {liveMatch.lokasi_lapangan || "Lapangan Utama"}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)", marginBottom: 32, fontStyle: "italic" }}>
          Tidak ada pertandingan yang sedang berlangsung.
        </div>
      )}

      {/* Upcoming & Recent */}
      <div style={{ display: "grid", gridTemplateColumns: upcomingMatches.length > 0 && recentResults.length > 0 ? "1fr 1fr" : "1fr", gap: 28 }}>

        {/* Upcoming */}
        {upcomingMatches.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.25)", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              Jadwal Berikutnya
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcomingMatches.map((match) => (
                <div key={match.id} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 10, padding: "12px 14px", transition: "border-color .2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: "#ff9500", fontWeight: 700, letterSpacing: ".08em" }}>🕒 {match.waktu}</span>
                    {match.event_nama && <span style={{ fontSize: 9, color: "rgba(255,255,255,.2)", letterSpacing: ".06em" }}>🏆 {match.event_nama}</span>}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: ".04em", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {match.tim_1_nama}
                    </span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,.2)", fontWeight: 700, padding: "2px 6px", background: "rgba(255,255,255,.03)", borderRadius: 3, flexShrink: 0 }}>VS</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: ".04em", flex: 1, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {match.tim_2_nama}
                    </span>
                  </div>
                  {match.lokasi && (
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,.2)", marginTop: 6 }}>📍 {match.lokasi}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.25)", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              Hasil Terkini
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentResults.map((match) => (
                <div key={match.id} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 700, letterSpacing: ".08em" }}>✅ {match.waktu}</span>
                    {match.event_nama && <span style={{ fontSize: 9, color: "rgba(255,255,255,.2)", letterSpacing: ".06em" }}>🏆 {match.event_nama}</span>}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: ".04em", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {match.tim_1_nama}
                    </span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#fff", padding: "2px 10px", background: "rgba(255,255,255,.05)", borderRadius: 5, flexShrink: 0, letterSpacing: ".04em" }}>
                      {match.skor_tim_1} : {match.skor_tim_2}
                    </span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: ".04em", flex: 1, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {match.tim_2_nama}
                    </span>
                  </div>
                  {match.lokasi && (
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,.2)", marginTop: 6 }}>📍 {match.lokasi}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fallback */}
      {upcomingMatches.length === 0 && recentResults.length === 0 && !liveMatch && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)", padding: "16px 0", fontStyle: "italic" }}>
          Tidak ada jadwal pertandingan yang tersedia saat ini.
        </div>
      )}

    </section>
  );
};

export default LiveMatch;
