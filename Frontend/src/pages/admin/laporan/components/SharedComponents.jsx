import React from "react";
import { formatCurrency, formatCurrencyShort, YEAR_OPTIONS } from "../helpers";

export function StatCard({ label, value, colorClass, note, noteClass }) {
  return (
    <div className="rounded-2xl p-5 bg-base-200 border border-base-content/5">
      <p className={`text-[11px] font-semibold uppercase tracking-[1.5px] ${colorClass}`}>{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-base-content leading-none">{value}</p>
      {note && <p className={`text-[11px] mt-1.5 ${noteClass || "text-base-content/40"}`}>{note}</p>}
    </div>
  );
}

export function BarPair({ data, maxValue, labelKey = "label" }) {
  return (
    <div className="flex items-end gap-4 h-48">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end min-w-0">
          <div className="flex items-end gap-1.5 h-full w-full justify-center">
            <div
              className="w-3.5 rounded-t-md bg-emerald-400/80"
              style={{ height: `${Math.max(2, ((d.pemasukan || 0) / maxValue) * 100)}%` }}
              title={`Pemasukan: ${formatCurrency(d.pemasukan)}`}
            />
            <div
              className="w-3.5 rounded-t-md bg-rose-400/80"
              style={{ height: `${Math.max(2, ((d.pengeluaran || 0) / maxValue) * 100)}%` }}
              title={`Pengeluaran: ${formatCurrency(d.pengeluaran)}`}
            />
          </div>
          <span className="text-[10px] text-base-content/40 font-semibold truncate w-full text-center">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

export function CategoryList({ title, subtitle, items, barClass }) {
  return (
    <div className="rounded-2xl p-6 bg-base-200 border border-base-content/5">
      <div className="mb-5">
        <h3 className="font-semibold text-[14px]">{title}</h3>
        <p className="text-xs text-base-content/40">{subtitle}</p>
      </div>
      <div className="space-y-3.5">
        {items.length ? (
          items.map((c) => (
            <div key={c.kategori}>
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span className="font-medium text-base-content/70">{c.kategori}</span>
                <span className="text-base-content/40 font-semibold">{formatCurrencyShort(c.nominal)} · {c.pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-base-300/60 overflow-hidden">
                <div className={`h-full rounded-full ${barClass}`} style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-base-content/40 py-4 text-center">Belum ada data.</div>
        )}
      </div>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-xl px-4 py-3 text-sm bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-between">
      <span>{message}</span>
      {onRetry && <button onClick={onRetry} className="text-xs font-bold underline">Muat ulang</button>}
    </div>
  );
}

export function TabLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-base-content/50">
      <span className="loading loading-spinner loading-md" />
      <p className="text-sm">Memuat data...</p>
    </div>
  );
}

export function YearSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-[12px] rounded-xl px-3 py-2 bg-base-300/50 border border-base-content/10 outline-none font-semibold"
    >
      {YEAR_OPTIONS.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  );
}
