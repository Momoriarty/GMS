import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Search,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from "lucide-react";

// ─── Internal helpers ──────────────────────────────────────────────────────

const COLORS = [
  { bg: "oklch(var(--in)/0.15)", color: "oklch(var(--in))" },
  { bg: "oklch(var(--wa)/0.15)", color: "oklch(var(--wa))" },
  { bg: "oklch(var(--su)/0.15)", color: "oklch(var(--su))" },
  { bg: "oklch(var(--er)/0.15)", color: "oklch(var(--er))" },
  { bg: "oklch(var(--p)/0.15)", color: "oklch(var(--p))" },
];
const avatarColor = (n = "") => COLORS[(n?.charCodeAt(0) || 0) % COLORS.length];
const initials = (n = "") =>
  n.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "--";
const authHeaders = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// ─── Toast ─────────────────────────────────────────────────────────────────

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl min-w-[200px] max-w-xs border backdrop-blur-md text-sm shadow-xl
            ${t.type === "success"
              ? "bg-success/10 border-success/30 text-success"
              : "bg-error/10 border-error/30 text-error"
            }`}
          style={{ animation: "slideIn 0.2s ease" }}
        >
          {t.type === "success"
            ? <CheckCircle2 size={15} className="shrink-0" />
            : <X size={15} className="shrink-0" />}
          <span className="text-[13px]">{t.message}</span>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// ─── Cell Renderers ────────────────────────────────────────────────────────

function CellAvatar({ row, col }) {
  const ac = avatarColor(row[col.key]);
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-semibold"
        style={{ background: ac.bg, color: ac.color }}
      >
        {initials(row[col.key])}
      </div>
      <div>
        <div className="text-[13px] font-medium text-base-content">{row[col.key]}</div>
        {col.subKey && (
          <div className="text-[11px] text-base-content/40 mt-0.5">@{row[col.subKey] || "user"}</div>
        )}
      </div>
    </div>
  );
}

function CellBadge({ row, col }) {
  const val = row[col.key];
  const cm = col.colorMap?.[val];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border"
      style={{
        background: cm?.bg || "oklch(var(--bc)/0.06)",
        borderColor: cm?.bg || "oklch(var(--bc)/0.05)",
        color: cm?.color || "oklch(var(--bc)/0.7)",
      }}
    >
      {cm?.dot && (
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cm.color }} />
      )}
      {val}
    </span>
  );
}

function CellText({ row, col }) {
  return <span className="text-[12px] text-base-content/60">{row[col.key] ?? "-"}</span>;
}

// ─── Overlay + Modal shell ─────────────────────────────────────────────────

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-base-200 border border-base-content/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, titleColor, icon, onClose }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-content/10">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[14px] font-medium" style={{ color: titleColor || undefined }}>
          {title}
        </span>
      </div>
      <button onClick={onClose} className="text-base-content/40 hover:text-base-content transition-colors">
        <X size={15} />
      </button>
    </div>
  );
}

function ModalFooter({ onClose, onConfirm, loading, label, variant = "default" }) {
  const confirmClass = variant === "danger"
    ? "bg-error/15 text-error border border-error/30 hover:bg-error/25"
    : "bg-base-content/10 text-base-content hover:bg-base-content/15";
  return (
    <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-base-content/10">
      <button
        onClick={onClose}
        className="text-[13px] px-3.5 py-1.5 rounded-lg border border-base-content/10 text-base-content/60 hover:text-base-content transition-colors bg-transparent cursor-pointer"
      >
        Batal
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={`text-[13px] px-4 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${confirmClass}`}
      >
        {loading ? "Memproses…" : label}
      </button>
    </div>
  );
}

// ─── Form Field ────────────────────────────────────────────────────────────

function FormField({ f, value, onChange }) {
  const inputClass = "w-full px-3 py-2 text-[13px] rounded-lg bg-base-300 border border-base-content/10 text-base-content outline-none focus:border-base-content/30 transition-colors";
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-base-content/40 mb-1.5">
        {f.label}
      </label>
      {f.options ? (
        <select defaultValue={String(value).trim()} onChange={onChange} className={inputClass}>
          {f.options.map((o) => {
            const v = String(o.value ?? o).trim();
            return <option key={v} value={v}>{o.label ?? o}</option>;
          })}
        </select>
      ) : (
        <input
          type={f.type || "text"}
          value={value}
          onChange={onChange}
          placeholder={f.placeholder || ""}
          className={inputClass}
        />
      )}
    </div>
  );
}

// ─── Modal Edit ────────────────────────────────────────────────────────────

function ModalEdit({ row, editFields, onClose, onSubmit }) {
  const [form, setForm] = useState(
    Object.fromEntries(editFields.map((f) => [f.key, String(row[f.key] ?? "").trim()]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setLoading(true);
    setError("");
    try { await onSubmit(row.id, form); onClose(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menyimpan."); }
    finally { setLoading(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Edit data" icon={<Edit2 size={14} className="text-base-content/60" />} onClose={onClose} />
      <div className="px-5 py-4 flex flex-col gap-3.5">
        {error && <div className="text-[12px] text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</div>}
        {editFields.map((f) => <FormField key={f.key} f={f} value={form[f.key]} onChange={set(f.key)} />)}
      </div>
      <ModalFooter onClose={onClose} onConfirm={save} loading={loading} label="Simpan" />
    </Overlay>
  );
}

// ─── Modal Delete ──────────────────────────────────────────────────────────

function ModalDelete({ row, labelKey = "name", subLabelKey, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ac = avatarColor(row[labelKey]);

  const del = async () => {
    setLoading(true);
    setError("");
    try { await onSubmit(row.id); onClose(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menghapus."); }
    finally { setLoading(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Hapus data" titleColor="oklch(var(--er))" icon={<Trash2 size={14} className="text-error" />} onClose={onClose} />
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 bg-base-300 border border-base-content/5 rounded-xl px-4 py-3">
          <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold"
            style={{ background: ac.bg, color: ac.color }}>
            {initials(row[labelKey])}
          </div>
          <div>
            <div className="text-[14px] font-medium text-base-content">{row[labelKey]}</div>
            {subLabelKey && <div className="text-[11px] text-base-content/50 mt-0.5">{row[subLabelKey]}</div>}
          </div>
        </div>
        <div className="flex gap-2">
          <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
          <p className="text-[13px] text-base-content/60 leading-relaxed m-0">
            Tindakan ini tidak bisa dibatalkan. Data akan dihapus permanen.
          </p>
        </div>
        {error && <div className="text-[12px] text-error">{error}</div>}
      </div>
      <ModalFooter onClose={onClose} onConfirm={del} loading={loading} label="Ya, hapus" variant="danger" />
    </Overlay>
  );
}

// ─── Modal Create ──────────────────────────────────────────────────────────

function ModalCreate({ createFields, onClose, onSubmit }) {
  const [form, setForm] = useState(
    Object.fromEntries(createFields.map((f) => {
      if (f.options?.length > 0) return [f.key, String(f.options[0].value ?? f.options[0]).trim()];
      return [f.key, f.default ?? ""];
    }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setLoading(true);
    setError("");
    try { await onSubmit(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menyimpan."); }
    finally { setLoading(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Tambah data" icon={<Plus size={14} className="text-base-content/60" />} onClose={onClose} />
      <div className="px-5 py-4 flex flex-col gap-3.5">
        {error && <div className="text-[12px] text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</div>}
        {createFields.map((f) => <FormField key={f.key} f={f} value={form[f.key]} onChange={set(f.key)} />)}
      </div>
      <ModalFooter onClose={onClose} onConfirm={save} loading={loading} label="Simpan" />
    </Overlay>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, total, perPage, onChange }) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const btnBase = "min-w-[30px] h-[30px] flex items-center justify-center text-[12px] rounded-lg cursor-pointer transition-colors";

  return (
    <div className="px-5 py-3 border-t border-base-content/5 flex items-center justify-between flex-wrap gap-2">
      <span className="text-[12px] text-base-content/40">{start}–{end} dari {total}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className={`${btnBase} border border-base-content/10 text-base-content/60 hover:bg-base-content/10 disabled:opacity-30`}
        >
          <ChevronLeft size={13} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .map((p, i, arr) => (
            <React.Fragment key={p}>
              {arr[i - 1] && p - arr[i - 1] > 1 && (
                <span className="text-[12px] text-base-content/30 px-1">…</span>
              )}
              <button
                onClick={() => onChange(p)}
                className={`${btnBase} ${p === page
                  ? "bg-base-content text-base-100 font-semibold"
                  : "border border-base-content/10 text-base-content/60 hover:bg-base-content/10"
                  }`}
              >
                {p}
              </button>
            </React.Fragment>
          ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className={`${btnBase} border border-base-content/10 text-base-content/60 hover:bg-base-content/10 disabled:opacity-30`}
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── DataTable (komponen utama) ────────────────────────────────────────────

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
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(
    Object.fromEntries(filterFields.map((f) => [f, "all"]))
  );
  const [page, setPage] = useState(1);
  const [modalEdit, setModalEdit] = useState(null);
  const [modalDel, setModalDel] = useState(null);
  const [modalCreate, setModalCreate] = useState(false);
  const [toasts, setToasts] = useState([]);

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
    () => Object.fromEntries(
      filterFields.map((f) => [f, [...new Set(rows.map((r) => r[f]).filter(Boolean))]])
    ),
    [rows, filterFields]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((row) => {
      const matchSearch = !q || searchKeys.some((k) => row[k]?.toLowerCase?.().includes(q));
      const matchFilters = filterFields.every((f) => filters[f] === "all" || row[f] === filters[f]);
      return matchSearch && matchFilters;
    });
  }, [rows, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const hasFilter = search !== "" || filterFields.some((f) => filters[f] !== "all");

  const clearFilters = () => {
    setSearch("");
    setPage(1);
    setFilters(Object.fromEntries(filterFields.map((f) => [f, "all"])));
  };

  const handleSetFilter = (f, v) => { setFilters((p) => ({ ...p, [f]: v })); setPage(1); };

  const handleEdit = useCallback(async (id, body) => {
    if (onEdit) return onEdit(id, body);
    await axios.put(`${endpoint}/${id}`, body, { headers: authHeaders() });
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...body } : r)));
    showToast("Data berhasil diperbarui");
  }, [endpoint, onEdit, showToast]);

  const handleDelete = useCallback(async (id) => {
    if (onDelete) return onDelete(id);
    await axios.delete(`${endpoint}/${id}`, { headers: authHeaders() });
    setRows((prev) => prev.filter((r) => r.id !== id));
    showToast("Data berhasil dihapus");
  }, [endpoint, onDelete, showToast]);

  const handleCreate = useCallback(async (body) => {
    if (onCreate) return onCreate(body);
    const res = await axios.post(endpoint, body, { headers: authHeaders() });
    const newRow = res.data?.data || res.data;
    setRows((prev) => [newRow, ...prev]);
    showToast("Data berhasil ditambahkan");
  }, [endpoint, onCreate, showToast]);

  const showActions = editable || deletable || actions.length > 0;

  return (
    <div className="min-h-full">
      <Toast toasts={toasts} />

      {modalEdit && (
        <ModalEdit row={modalEdit} editFields={editFields} onClose={() => setModalEdit(null)} onSubmit={handleEdit} />
      )}
      {modalCreate && (
        <ModalCreate createFields={createFields} onClose={() => setModalCreate(false)} onSubmit={handleCreate} />
      )}
      {modalDel && (
        <ModalDelete
          row={modalDel}
          labelKey={deleteLabelKey || columns[0]?.key || "name"}
          subLabelKey={deleteSubKey}
          onClose={() => setModalDel(null)}
          onSubmit={handleDelete}
        />
      )}

      {/* Kontainer Utama */}
      <div className="bg-base-200 border border-base-content/5 rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-base-content/5 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-[14px] font-semibold text-base-content">{title}</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-base-content/60 bg-base-content/5 border border-base-content/5 rounded-full px-2.5 py-1">
              {filtered.length}{hasFilter && filtered.length !== rows.length ? ` dari ${rows.length}` : ""} data
            </span>
            {creatable && (
              <button
                onClick={() => setModalCreate(true)}
                className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg bg-base-content/10 hover:bg-base-content/15 text-base-content border-none cursor-pointer transition-colors"
              >
                <Plus size={13} /> Tambah
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        {(columns.length > 0 || filterFields.length > 0) && (
          <div className="px-5 py-2.5 border-b border-base-content/5 flex flex-wrap gap-2 items-center bg-base-content/[0.01]">
            <div className="relative flex-1 min-w-[140px] max-w-[280px]">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-lg bg-base-300 border border-base-content/5 text-base-content placeholder:text-base-content/30 outline-none focus:border-base-content/20 transition-colors"
              />
            </div>
            {filterFields.map((f) => (
              <select
                key={f}
                value={filters[f]}
                onChange={(e) => handleSetFilter(f, e.target.value)}
                className="text-[12px] px-2.5 py-1.5 rounded-lg bg-base-300 border border-base-content/5 text-base-content/70 outline-none cursor-pointer"
              >
                <option value="all">Semua {f}</option>
                {(filterOptions[f] || []).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            ))}
            {hasFilter && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-[12px] text-base-content/50 hover:text-base-content bg-transparent border-none cursor-pointer px-2 py-1.5 rounded-lg transition-colors"
              >
                <X size={12} /> Reset
              </button>
            )}
          </div>
        )}

        {/* Table — hanya tabel yang scroll horizontal */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 600 }}>
            <thead>
              <tr className="border-b border-base-content/5">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-base-content/40 w-10">#</th>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-base-content/40 whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                {showActions && (
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-base-content/40">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 2} className="py-10 text-center text-[13px] text-base-content/50">Memuat…</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns.length + 2} className="py-10 text-center text-[13px] text-error">{error}</td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="py-12 text-center text-[13px] text-base-content/50">
                    Tidak ada data.{" "}
                    {hasFilter && (
                      <button onClick={clearFilters} className="text-[12px] text-base-content/70 underline bg-transparent border-none cursor-pointer">
                        Reset filter
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                pageData.map((row, i) => (
                  <tr
                    key={row.id ?? i}
                    className="border-b border-base-content/[0.03] hover:bg-base-content/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-[12px] text-base-content/50">
                      {(safePage - 1) * perPage + i + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render ? col.render(row)
                          : col.type === "avatar" ? <CellAvatar row={row} col={col} />
                            : col.type === "badge" ? <CellBadge row={row} col={col} />
                              : <CellText row={row} col={col} />}
                      </td>
                    ))}
                    {showActions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {editable && (
                            <button
                              onClick={() => setModalEdit(row)}
                              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer bg-base-content/5 border border-base-content/10 text-base-content/70 hover:bg-base-content/10 transition-colors"
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                          )}
                          {deletable && (
                            <button
                              onClick={() => setModalDel(row)}
                              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-colors"
                            >
                              <Trash2 size={11} /> Hapus
                            </button>
                          )}
                          {actions.map((action, index) => (
                            <button
                              key={index}
                              title={action.tooltip || action.label}
                              onClick={() => action.onClick(row)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer border border-base-content/10 bg-base-content/5 hover:bg-base-content/10 transition-colors"
                              style={{ color: action.color || undefined }}
                            >
                              {action.icon}
                              {action.label}
                            </button>
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

        <Pagination
          page={safePage}
          totalPages={totalPages}
          total={filtered.length}
          perPage={perPage}
          onChange={setPage}
        />
      </div>
    </div>
  );
}