import React from "react";
import { Link } from "react-router-dom";

// Helper lokal untuk memformat tanggal
const fmtDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(".", ":"); // Mengubah pemisah titik bawaan id-ID (15.30) menjadi titik dua (15:30)
};

// Helper lokal untuk memformat mata uang
const fmtCurrency = (amount) => {
  if (amount === undefined || amount === null) return "Gratis";
  if (amount === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function EventCard({ event }) {
  // Hitung data kuota
  const filled = event.pendaftaran_count ?? 0;
  const total = event.kuota_tim ?? 0;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const sisa = total - filled;

  // Konfigurasi style berdasarkan status event
  const statusConfig = {
    draft: { cls: "badge-warning", label: "Draft" },
    aktif: { cls: "badge-success", label: "Aktif" },
    selesai: { cls: "badge-ghost", label: "Selesai" },
  };
  const status = statusConfig[event.status] || { cls: "badge-ghost", label: event.status };

  // Logika penonaktifan tombol pendaftaran
  const isClosed = event.status === "draft" || event.status === "selesai" || sisa <= 0;

  // Teks tombol dinamis
  const getButtonLabel = () => {
    if (event.status === "draft") return "Segera Hadir";
    if (event.status === "selesai") return "Event Selesai";
    if (sisa <= 0) return "Kuota Penuh";
    return "Daftar Sekarang";
  };

  // Ambil ID Event secara fleksibel (antisipasi id atau _id)
  const eventId = event.id || event._id;

  return (
    <div className="card bg-base-200 border border-base-300 shadow hover:shadow-lg transition h-full justify-between">
      <div className="card-body p-4 gap-3">

        {/* Nama Event + Badge Status */}
        <div className="flex justify-between items-start gap-2">
          <div className="font-bold text-sm leading-tight">{event.nama_event}</div>
          <span className={`badge badge-sm font-semibold shrink-0 ${status.cls}`}>
            {status.label}
          </span>
        </div>

        {/* Lokasi & Tanggal */}
        <div className="text-xs space-y-1 text-base-content/60">
          <div>📍 {event.lokasi}</div>
          <div>📅 {fmtDate(event.tanggal_mulai)} — {fmtDate(event.tanggal_selesai)}</div>
        </div>

        <div className="divider my-0" />

        {/* Progress Bar Kuota */}
        <div>
          <div className="flex justify-between text-xs text-base-content/50 mb-1.5">
            <span>{filled}/{total} slot terisi</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-error" : "bg-warning"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Biaya + Sisa Slot */}
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-sm text-base-content/90">
            {fmtCurrency(event.biaya_pendaftaran)}
          </span>
          <span className={`font-bold ${sisa <= 3 ? "text-error" : "text-success"}`}>
            {sisa > 0 ? `${sisa} slot tersisa` : "Penuh"}
          </span>
        </div>

        {/* Tombol Aksi Navigasi */}
        <div className="card-actions mt-2 gap-2">
          {isClosed ? (
            <>
              <button
                disabled
                className="btn btn-sm flex-1 font-bold tracking-wide btn-disabled bg-base-300 text-base-content/30"
              >
                {getButtonLabel()}
              </button>
              <Link
                to={`/events/${eventId}`}
                className="btn btn-sm flex-1 font-bold tracking-wide bg-white/10 hover:bg-white/20 text-base-content border border-base-300 text-center flex items-center justify-center no-underline transition-colors duration-200"
              >
                Detail
              </Link>
            </>
          ) : (
            <>
              <Link
                to={`/events/${eventId}`}
                className="btn btn-sm flex-1 font-bold tracking-wide bg-[#ff4800] hover:bg-[#e03e00] text-white border-none shadow-md text-center flex items-center justify-center no-underline transition-colors duration-200"
              >
                {getButtonLabel()}
              </Link>
              <Link
                to={`/events/${eventId}`}
                className="btn btn-sm flex-1 font-bold tracking-wide bg-white/10 hover:bg-white/20 text-base-content border border-base-300 text-center flex items-center justify-center no-underline transition-colors duration-200"
              >
                Detail
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
}