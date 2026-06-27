import React from "react";

export default function EventCard({ event }) {
  const filled = event.pendaftaran_count ?? 0;
  const total = event.kuota_tim ?? 0;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const sisa = total - filled;

  const statusConfig = {
    draft:   { cls: "badge-warning",  label: "Draft" },
    aktif:   { cls: "badge-success",  label: "Aktif" },
    selesai: { cls: "badge-ghost",    label: "Selesai" },
  };
  const status = statusConfig[event.status] || { cls: "badge-ghost", label: event.status };

  return (
    <div className="card bg-base-200 border border-base-300 shadow hover:shadow-lg transition">
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
          {/* <div>📅 {fmtDate(event.tanggal_mulai)} — {fmtDate(event.tanggal_selesai)}</div> */}
        </div>

        <div className="divider my-0" />

        {/* Kuota progress */}
        <div>
          <div className="flex justify-between text-xs text-base-content/50 mb-1.5">
            <span>{filled}/{total} slot terisi</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-warning transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Biaya + Sisa slot */}
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-base-content/70">
            {/* {fmtCurrency(event.biaya_pendaftaran)} */}
          </span>
          <span className={`font-bold ${sisa <= 3 ? "text-error" : "text-success"}`}>
            {sisa > 0 ? `${sisa} slot tersisa` : "Penuh"}
          </span>
        </div>

      </div>
    </div>
  );
}