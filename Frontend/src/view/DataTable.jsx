import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Search, X, Edit2, Trash2, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle2, Plus, CircleX,
  ChevronsUpDown, ChevronUp, ChevronDown, DatabaseZap, FilterX,
} from "lucide-react";

// ─── Formatters ────────────────────────────────────────────────────────────

/**
 * Format tanggal ISO → "01 Jul 2025"
 * Gunakan di column: { key: "start_date", label: "Mulai", type: "date" }
 */
export const fmtDate = (val) => {
  if (!val) return "-";
  const d = parseLocal(val);
  if (!d || isNaN(d)) return val;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtDateTime = (val) => {
  if (!val) return "-";
  const d = parseLocal(val);
  if (!d || isNaN(d)) return val;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

/**
 * Format angka → "Rp 500.000"
 * Gunakan di column: { key: "price", label: "Harga", type: "currency" }
 */
export const fmtCurrency = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(val));
};

/**
 * Format angka biasa dengan titik pemisah ribuan → "16.000"
 * Gunakan di column: { key: "quota", label: "Kuota", type: "number" }
 */
export const fmtNumber = (val) => {
  if (val === null || val === undefined || val === "") return "-";
  return new Intl.NumberFormat("id-ID").format(Number(val));
};

// ─── Internal helpers ──────────────────────────────────────────────────────

const AVATAR_COLORS = ["primary", "secondary", "accent", "info", "success", "warning", "error"];
const avatarColorClass = (n = "") => AVATAR_COLORS[(n?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (n = "") =>
  n.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "--";

const authHeaders = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// ─── Toast ─────────────────────────────────────────────────────────────────

function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast toast-end toast-bottom z-[200]">
      {toasts.map((t) => (
        <div key={t.id} className={`alert shadow-lg text-sm ${t.type === "success" ? "alert-success" : "alert-error"}`}>
          {t.type === "success" ? <CheckCircle2 size={16} /> : <CircleX size={16} />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Cell Renderers ────────────────────────────────────────────────────────

function CellAvatar({ row, col }) {
  const color = avatarColorClass(row[col.key]);
  return (
    <div className="flex items-center gap-3">
      <div className="avatar placeholder">
        <div className={`bg-${color} text-${color}-content rounded-lg w-9 h-9 text-xs font-bold`}>
          <span>{initials(row[col.key])}</span>
        </div>
      </div>
      <div>
        <div className="font-semibold text-sm leading-tight">{row[col.key]}</div>
        {col.subKey && <div className="text-xs text-base-content/40 mt-0.5">@{row[col.subKey] || "user"}</div>}
      </div>
    </div>
  );
}

/**
 * Badge dengan colorMap DaisyUI class string.
 * colorMap contoh: { aktif: "badge-success", draft: "badge-ghost", nonaktif: "badge-error" }
 * Atau pakai object: { aktif: { cls: "badge-success", dot: true } }
 */
function CellBadge({ row, col }) {
  const val = row[col.key];
  const cm = col.colorMap?.[val];
  const cls = typeof cm === "string" ? cm : cm?.cls || "badge-ghost";
  const dot = typeof cm === "object" ? cm?.dot : false;
  return (
    <span className={`badge badge-sm font-medium gap-1.5 ${cls}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {val ?? "-"}
    </span>
  );
}

// Tambahkan helper ini di atas CellDate
const parseLocal = (val) => {
  if (!val) return null;
  // Kalau sudah ada timezone info (ada +/- atau Z), parse biasa
  if (/Z|[+-]\d{2}:\d{2}$/.test(val)) return new Date(val);
  // Kalau tidak ada timezone (dari Laravel tanpa cast), anggap lokal
  return new Date(val.replace("T", " "));
};

function CellDate({ row, col }) {
  const raw = row[col.key];
  const d = parseLocal(raw);  // ← pakai parseLocal
  if (!d || isNaN(d)) return <span className="text-sm text-base-content/40">-</span>;
  return (
    <div className="flex flex-col">
      <span className="text-sm text-base-content/80">
        {d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
    </div>
  );
}

function CellDateTime({ row, col }) {
  const raw = row[col.key];
  if (!raw) return <span className="text-sm text-base-content/40">-</span>;
  const d = parseLocal(raw);  // ← pakai parseLocal
  if (!d || isNaN(d)) return <span className="text-sm text-base-content/40">-</span>;
  return (
    <div className="flex flex-col leading-tight">
      <span className="text-sm text-base-content/80">
        {d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
      <span className="text-xs text-base-content/40 mt-0.5">
        {d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}

function CellCurrency({ row, col }) {
  return <span className="text-sm font-medium tabular-nums text-base-content/80">{fmtCurrency(row[col.key])}</span>;
}

function CellNumber({ row, col }) {
  return <span className="text-sm tabular-nums text-base-content/70">{fmtNumber(row[col.key])}</span>;
}

function CellText({ row, col }) {
  return <span className="text-sm text-base-content/60">{row[col.key] ?? "-"}</span>;
}

// ─── Sort Icon ─────────────────────────────────────────────────────────────

function SortIcon({ colKey, sortKey, sortDir }) {
  if (sortKey !== colKey) return <ChevronsUpDown size={12} className="text-base-content/30 ml-1 inline" />;
  return sortDir === "asc"
    ? <ChevronUp size={12} className="text-primary ml-1 inline" />
    : <ChevronDown size={12} className="text-primary ml-1 inline" />;
}

// ─── Empty State ───────────────────────────────────────────────────────────

function EmptyState({ hasFilter, onReset }) {
  return (
    <tr>
      <td colSpan={99} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center">
            {hasFilter
              ? <FilterX size={22} className="text-base-content/30" />
              : <DatabaseZap size={22} className="text-base-content/30" />}
          </div>
          <div>
            <p className="text-sm font-medium text-base-content/60">
              {hasFilter ? "Tidak ada hasil" : "Belum ada data"}
            </p>
            <p className="text-xs text-base-content/40 mt-0.5">
              {hasFilter ? "Coba ubah atau reset filter pencarian." : "Data akan muncul di sini setelah ditambahkan."}
            </p>
          </div>
          {hasFilter && (
            <button onClick={onReset} className="btn btn-sm btn-ghost gap-1.5 text-primary">
              <X size={13} /> Reset Filter
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Modal helpers ─────────────────────────────────────────────────────────

function ModalHeader({ title, icon, danger }) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 border-b border-base-content/10`}>
      <div className={`flex items-center gap-2 font-semibold text-sm ${danger ? "text-error" : ""}`}>
        {icon}{title}
      </div>
      <form method="dialog">
        <button className="btn btn-sm btn-circle btn-ghost text-base-content/40"><X size={14} /></button>
      </form>
    </div>
  );
}

function ModalFooter({ onConfirm, loading, label, variant = "default" }) {
  return (
    <div className="flex justify-end gap-2 px-5 py-4 border-t border-base-content/10">
      <form method="dialog">
        <button className="btn btn-sm btn-ghost">Batal</button>
      </form>
      <button onClick={onConfirm} disabled={loading}
        className={`btn btn-sm ${variant === "danger" ? "btn-error" : "btn-neutral"}`}>
        {loading && <span className="loading loading-spinner loading-xs" />}
        {loading ? "Memproses…" : label}
      </button>
    </div>
  );
}

// ─── Form Field ────────────────────────────────────────────────────────────
function FormField({ f, value, onChange }) {
  const formatDisplay = (val) => {
    const num = String(val).replace(/\D/g, "");
    if (!num) return "";
    // Manual format pakai regex, tidak pakai Intl sama sekali
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleCurrencyChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    onChange({ target: { value: raw } });
  };

  return (
    <label className="form-control w-full">
      <div className="label pb-1">
        <span className="label-text text-xs font-semibold uppercase tracking-widest text-base-content/40">{f.label}</span>
        {f.required && <span className="label-text-alt text-error">*</span>}
      </div>
      {f.options ? (
        <select value={String(value ?? "").trim()} onChange={onChange} className="select select-bordered select-sm w-full">
          {f.options.map((o) => {
            const v = String(o.value ?? o).trim();
            return <option key={v} value={v}>{o.label ?? o}</option>;
          })}
        </select>
      ) : f.type === "textarea" ? (
        <textarea value={value} onChange={onChange} placeholder={f.placeholder || ""}
          className="textarea textarea-bordered textarea-sm w-full" rows={3} />
      ) : f.type === "currency-input" ? (
        <label className="input input-bordered input-sm w-full flex items-center gap-2">
          <span className="text-base-content/40 text-xs font-medium">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={formatDisplay(value)}
            onChange={handleCurrencyChange}
            placeholder={f.placeholder || "0"}
            className="grow bg-transparent"
          />
        </label>
      ) : (
        <input type={f.type || "text"} value={value} onChange={onChange}
          placeholder={f.placeholder || ""} className="input input-bordered input-sm w-full" />
      )}
      {f.hint && <div className="label pt-1"><span className="label-text-alt text-base-content/40">{f.hint}</span></div>}
    </label>
  );
}

// ─── Modal Edit ────────────────────────────────────────────────────────────

function ModalEdit({ modalId, row, editFields, onSubmit, onClose }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (row) {
      setForm(Object.fromEntries(editFields.map((f) => {
        let val = String(row[f.key] ?? "").trim();
        if (f.type === "datetime-local" && val.length > 16) val = val.slice(0, 16);
        return [f.key, val];
      })));
      setError("");
    }
  }, [row]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setLoading(true); setError("");
    try { await onSubmit(row.id, form); document.getElementById(modalId)?.close(); onClose(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menyimpan."); }
    finally { setLoading(false); }
  };

  return (
    <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box p-0 overflow-hidden">
        <ModalHeader title="Edit Data" icon={<Edit2 size={14} />} />
        <div className="px-5 py-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {error && <div role="alert" className="alert alert-error py-2 text-xs"><X size={13} />{error}</div>}
          {editFields.map((f) => <FormField key={f.key} f={f} value={form[f.key] ?? ""} onChange={set(f.key)} />)}
        </div>
        <ModalFooter onConfirm={save} loading={loading} label="Simpan" />
      </div>
      <form method="dialog" className="modal-backdrop"><button onClick={onClose}>close</button></form>
    </dialog>
  );
}

// ─── Modal Delete ──────────────────────────────────────────────────────────

function ModalDelete({ modalId, row, labelKey = "name", subLabelKey, onSubmit, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setError(""); }, [row]);

  const del = async () => {
    setLoading(true); setError("");
    try { await onSubmit(row.id); document.getElementById(modalId)?.close(); onClose(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menghapus."); }
    finally { setLoading(false); }
  };

  const color = avatarColorClass(row?.[labelKey]);
  return (
    <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box p-0 overflow-hidden">
        <ModalHeader title="Hapus Data" icon={<Trash2 size={14} />} danger />
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 bg-base-200 rounded-xl px-4 py-3">
            <div className="avatar placeholder">
              <div className={`bg-${color} text-${color}-content rounded-lg w-10 h-10 text-xs font-bold`}>
                <span>{initials(row?.[labelKey])}</span>
              </div>
            </div>
            <div>
              <div className="font-semibold text-sm">{row?.[labelKey]}</div>
              {subLabelKey && <div className="text-xs text-base-content/50 mt-0.5">{row?.[subLabelKey]}</div>}
            </div>
          </div>
          <div role="alert" className="alert alert-warning py-2 text-xs">
            <AlertTriangle size={13} />
            <span>Tindakan ini tidak bisa dibatalkan. Data akan dihapus permanen.</span>
          </div>
          {error && <div role="alert" className="alert alert-error py-2 text-xs"><X size={13} />{error}</div>}
        </div>
        <ModalFooter onConfirm={del} loading={loading} label="Ya, Hapus" variant="danger" />
      </div>
      <form method="dialog" className="modal-backdrop"><button onClick={onClose}>close</button></form>
    </dialog>
  );
}

// ─── Modal Create ──────────────────────────────────────────────────────────

function ModalCreate({
  modalId,
  createFields,
  onSubmit,
  onClose,
  formColumns = 2,
}) {
  const init = Object.fromEntries(
    createFields.map((f) => {
      if (f.options?.length > 0) {
        return [
          f.key,
          String(f.options[0].value ?? f.options[0]).trim(),
        ];
      }
      return [f.key, f.default ?? ""];
    })
  );

  const [form, setForm] = useState(init);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) =>
    setForm((p) => ({
      ...p,
      [k]: e.target.value,
    }));

  const save = async () => {
    setLoading(true);
    setError("");

    try {
      await onSubmit(form);

      document.getElementById(modalId)?.close();

      onClose();
      setForm(init);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Gagal menyimpan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      id={modalId}
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box p-0 overflow-hidden max-w-4xl">
        <ModalHeader
          title="Tambah Data"
          icon={<Plus size={14} />}
        />

        <div
          className={`px-5 py-4 grid gap-3 max-h-[60vh] overflow-y-auto ${formColumns === 3
            ? "grid-cols-3"
            : formColumns === 2
              ? "grid-cols-2"
              : "grid-cols-1"
            }`}
        >
          {error && (
            <div
              role="alert"
              className={`alert alert-error py-2 text-xs ${formColumns > 1 ? "col-span-full" : ""
                }`}
            >
              <X size={13} />
              {error}
            </div>
          )}

          {createFields.map((f) => (
            <div
              key={f.key}
              className={
                f.colSpan === 3
                  ? "col-span-3"
                  : f.colSpan === 2
                    ? "col-span-2"
                    : ""
              }
            >
              <FormField
                f={f}
                value={form[f.key]}
                onChange={set(f.key)}
              />
            </div>
          ))}
        </div>

        <ModalFooter
          onConfirm={save}
          loading={loading}
          label="Simpan"
        />
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, total, perPage, onChange }) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="px-5 py-3.5 border-t border-base-content/10 flex items-center justify-between flex-wrap gap-2">
      <span className="text-xs text-base-content/40 tabular-nums">{start}–{end} dari {total} data</span>
      <div className="join">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className="join-item btn btn-sm btn-ghost">
          <ChevronLeft size={13} />
        </button>
        {pages.map((p, i, arr) => (
          <React.Fragment key={p}>
            {arr[i - 1] && p - arr[i - 1] > 1 && (
              <button className="join-item btn btn-sm btn-disabled opacity-30">…</button>
            )}
            <button onClick={() => onChange(p)} className={`join-item btn btn-sm ${p === page ? "btn-active btn-neutral" : "btn-ghost"}`}>
              {p}
            </button>
          </React.Fragment>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="join-item btn btn-sm btn-ghost">
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── DataTable ─────────────────────────────────────────────────────────────

export default function DataTable({
  endpoint,
  title = "Data",
  dataKey = "data",
  perPage = 8,
  columns = [],
  searchFields,
  filterFields = [],
  editable = false,
  editFields = [],
  deletable = false,
  actions = [],
  deleteLabelKey,
  deleteSubKey,
  onEdit,
  onDelete,
  creatable = false,
  createFields = [],
  onCreate,
  sortable = true, // aktifkan sorting kolom
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(Object.fromEntries(filterFields.map((f) => [f, "all"])));
  const [page, setPage] = useState(1);
  const [activeRow, setActiveRow] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const MODAL_EDIT = "modal-edit";
  const MODAL_DEL = "modal-delete";
  const MODAL_CREATE = "modal-create";

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const searchKeys = searchFields || columns.map((c) => c.key);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(endpoint, { headers: authHeaders() });
        setRows(res.data[dataKey] || []);
      } catch (err) {
        setError(err.response?.data?.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [endpoint]);

  const filterOptions = useMemo(
    () => Object.fromEntries(filterFields.map((f) => [f, [...new Set(rows.map((r) => r[f]).filter(Boolean))]])),
    [rows, filterFields]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = rows.filter((row) => {
      const matchSearch = !q || searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q));
      const matchFilters = filterFields.every((f) => filters[f] === "all" || row[f] === filters[f]);
      return matchSearch && matchFilters;
    });

    // Sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "id");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [rows, search, filters, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const hasFilter = search !== "" || filterFields.some((f) => filters[f] !== "all");

  const clearFilters = () => {
    setSearch(""); setPage(1);
    setFilters(Object.fromEntries(filterFields.map((f) => [f, "all"])));
  };

  const handleSetFilter = (f, v) => { setFilters((p) => ({ ...p, [f]: v })); setPage(1); };

  const handleSort = (key) => {
    if (!sortable) return;
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const openModal = (id) => document.getElementById(id)?.showModal();

  const handleEdit = useCallback(async (id, body) => {
    if (onEdit) return onEdit(id, body);

    // Format datetime-local ke format yang Laravel terima
    const formatted = { ...body };
    editFields.forEach((f) => {
      if (f.type === "datetime-local" && formatted[f.key]) {
        formatted[f.key] = formatted[f.key].replace("T", " ") + ":00";
        // "2025-06-26T20:00" → "2025-06-26 20:00:00"
      }
    });

    await axios.put(`${endpoint}/${id}`, formatted, { headers: authHeaders() });
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...formatted } : r)));
    showToast("Data berhasil diperbarui");
  }, [endpoint, onEdit, showToast, editFields]);

  const handleDelete = useCallback(async (id) => {
    if (onDelete) return onDelete(id);
    await axios.delete(`${endpoint}/${id}`, { headers: authHeaders() });
    setRows((prev) => prev.filter((r) => r.id !== id));
    showToast("Data berhasil dihapus");
  }, [endpoint, onDelete, showToast]);

  const handleCreate = useCallback(async (body) => {
    if (onCreate) return onCreate(body);

    const formatted = { ...body };
    createFields.forEach((f) => {
      if (f.type === "datetime-local" && formatted[f.key]) {
        formatted[f.key] = formatted[f.key].replace("T", " ") + ":00";
      }
    });

    const res = await axios.post(endpoint, formatted, { headers: authHeaders() });
    const newRow = res.data?.data || res.data;
    setRows((prev) => [newRow, ...prev]);
    showToast("Data berhasil ditambahkan");
  }, [endpoint, onCreate, showToast, createFields]);
  const showActions = editable || deletable || actions.length > 0;

  // Render cell berdasarkan type
  const renderCell = (row, col) => {
    if (col.render) return col.render(row);
    switch (col.type) {
      case "avatar": return <CellAvatar row={row} col={col} />;
      case "badge": return <CellBadge row={row} col={col} />;
      case "date": return <CellDate row={row} col={col} />;
      case "datetime": return <CellDateTime row={row} col={col} />;
      case "currency": return <CellCurrency row={row} col={col} />;
      case "number": return <CellNumber row={row} col={col} />;
      default: return <CellText row={row} col={col} />;
    }
  };

  return (
    <div className="w-full min-w-0">
      {/* Scrollbar styling — tipis dan adaptif theme */}
      <style>{`
        .dt-scroll::-webkit-scrollbar { height: 5px; }
        .dt-scroll::-webkit-scrollbar-track { background: transparent; }
        .dt-scroll::-webkit-scrollbar-thumb { background: oklch(var(--bc)/0.15); border-radius: 99px; }
        .dt-scroll::-webkit-scrollbar-thumb:hover { background: oklch(var(--bc)/0.3); }
      `}</style>
      <Toast toasts={toasts} />

      <ModalEdit modalId={MODAL_EDIT} row={activeRow} editFields={editFields} onSubmit={handleEdit} onClose={() => setActiveRow(null)} />
      <ModalDelete modalId={MODAL_DEL} row={activeRow} labelKey={deleteLabelKey || columns[0]?.key || "name"} subLabelKey={deleteSubKey} onSubmit={handleDelete} onClose={() => setActiveRow(null)} />
      <ModalCreate modalId={MODAL_CREATE} createFields={createFields} onSubmit={handleCreate} onClose={() => { }} />

      <div className="card bg-base-100 border border-base-content/10 shadow-sm w-full min-w-0 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-base-content/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <h2 className="font-semibold text-sm">{title}</h2>
            <div className="badge badge-neutral badge-sm tabular-nums">
              {filtered.length}{hasFilter && filtered.length !== rows.length ? ` / ${rows.length}` : ""} data
            </div>
          </div>
          {creatable && (
            <button onClick={() => openModal(MODAL_CREATE)} className="btn btn-sm btn-neutral gap-1.5">
              <Plus size={13} /> Tambah
            </button>
          )}
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 border-b border-base-content/10 flex flex-wrap gap-2 items-center bg-base-200/30">
          <label className="input input-sm input-bordered flex items-center gap-2 flex-1 min-w-[160px] max-w-[260px]">
            <Search size={13} className="text-base-content/40 shrink-0" />
            <input type="text" placeholder="Cari…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="grow text-sm bg-transparent" />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} className="text-base-content/30 hover:text-base-content/60">
                <X size={12} />
              </button>
            )}
          </label>

          {filterFields.map((f) => (
            <select key={f} value={filters[f]} onChange={(e) => handleSetFilter(f, e.target.value)}
              className="select select-sm select-bordered max-w-[180px]">
              <option value="all">Semua {f}</option>
              {(filterOptions[f] || []).map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          ))}

          {(sortKey || hasFilter) && (
            <div className="flex items-center gap-1 ml-auto">
              {sortKey && (
                <button onClick={() => { setSortKey(null); setSortDir("asc"); }}
                  className="btn btn-xs btn-ghost gap-1 text-base-content/50">
                  <ChevronsUpDown size={11} /> Reset sort
                </button>
              )}
              {hasFilter && (
                <button onClick={clearFilters} className="btn btn-xs btn-ghost gap-1 text-base-content/50">
                  <X size={11} /> Reset filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table — scroll horizontal hanya jika benar-benar tidak muat */}
        <div className="overflow-x-auto dt-scroll w-full">
          <table className="table table-sm w-full">
            <thead>
              <tr className="bg-base-200/40">
                <th className="w-8 text-[10px] font-semibold uppercase tracking-widest text-base-content/30 shrink-0">#</th>
                {columns.map((col) => (
                  <th key={col.key}
                    onClick={() => !col.noSort && handleSort(col.key)}
                    style={col.width ? { width: col.width } : undefined}
                    className={[
                      "text-[10px] font-semibold uppercase tracking-widest text-base-content/40 select-none",
                      // kolom angka/tanggal/badge → nowrap; teks panjang → bisa wrap
                      ["date", "datetime", "currency", "number", "badge"].includes(col.type)
                        ? "whitespace-nowrap"
                        : "max-w-[180px]",
                      !col.noSort && sortable ? "cursor-pointer hover:text-base-content/70 transition-colors" : "",
                      col.className || "",
                    ].join(" ")}>
                    {col.label}
                    {!col.noSort && sortable && <SortIcon colKey={col.key} sortKey={sortKey} sortDir={sortDir} />}
                  </th>
                ))}
                {showActions && (
                  <th className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40 whitespace-nowrap w-fit">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 2} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="loading loading-dots loading-md text-base-content/30" />
                      <p className="text-xs text-base-content/30">Memuat data…</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns.length + 2} className="py-10 text-center">
                    <div role="alert" className="alert alert-error max-w-sm mx-auto text-sm">
                      <X size={14} /> {error}
                    </div>
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <EmptyState hasFilter={hasFilter} onReset={clearFilters} />
              ) : (
                pageData.map((row, i) => (
                  <tr key={row.id ?? i} className="hover transition-colors border-b border-base-content/[0.04] last:border-0 group">
                    <td className="text-xs text-base-content/30 tabular-nums w-8 shrink-0">
                      {(safePage - 1) * perPage + i + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={col.key}
                        style={col.width ? { width: col.width } : undefined}
                        className={[
                          ["date", "datetime", "currency", "number", "badge"].includes(col.type)
                            ? "whitespace-nowrap"
                            : "break-words",
                          col.className || "",
                        ].join(" ")}>
                        {renderCell(row, col)}
                      </td>
                    ))}
                    {showActions && (
                      <td className="whitespace-nowrap">
                        {/* Desktop: label + icon | Mobile: icon only */}
                        <div className="flex items-center gap-0.5">
                          {editable && (
                            <button onClick={() => { setActiveRow(row); openModal(MODAL_EDIT); }}
                              className="btn btn-xs btn-ghost text-base-content/60 hover:text-base-content gap-1">
                              <Edit2 size={11} />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                          )}
                          {deletable && (
                            <button onClick={() => { setActiveRow(row); openModal(MODAL_DEL); }}
                              className="btn btn-xs btn-ghost text-error/60 hover:text-error hover:bg-error/10 gap-1">
                              <Trash2 size={11} />
                              <span className="hidden sm:inline">Hapus</span>
                            </button>
                          )}
                          {actions.map((action, index) => (
                            <div key={index} className="tooltip tooltip-left" data-tip={action.tooltip || action.label}>
                              <button onClick={() => action.onClick(row)}
                                className="btn btn-xs btn-ghost gap-1"
                                style={{ color: action.color || undefined }}>
                                {action.icon}
                                <span className="hidden sm:inline">{action.label}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={safePage} totalPages={totalPages} total={filtered.length} perPage={perPage} onChange={setPage} />
      </div>
    </div>
  );
}