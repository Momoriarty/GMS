import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { Search, X, Edit2, Trash2, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Plus } from "lucide-react";

// ─── Internal helpers ──────────────────────────────────────────────────────

const COLORS = [
  { bg: "rgba(178,219,249,0.15)", color: "#93c5fd" },
  { bg: "rgba(250,199,117,0.15)", color: "#fcd34d" },
  { bg: "rgba(174,179,236,0.15)", color: "#a5b4fc" },
  { bg: "rgba(160,225,203,0.15)", color: "#6ee7b7" },
  { bg: "rgba(240,153,123,0.15)", color: "#fca5a5" },
];
const avatarColor = (n = "") => COLORS[(n?.charCodeAt(0) || 0) % COLORS.length];
const initials = (n = "") => n.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "--";
const authHeaders = () => { const t = localStorage.getItem("token"); return t ? { Authorization: `Bearer ${t}` } : {}; };


// ─── Toast notification ────────────────────────────────────────────────────

function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderRadius: 10, minWidth: 220, maxWidth: 320,
          background: t.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
          border: `1px solid ${t.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          animation: "slideIn 0.2s ease",
          backdropFilter: "blur(8px)",
        }}>
          {t.type === "success"
            ? <CheckCircle2 size={15} style={{ color: "#34d399", flexShrink: 0 }} />
            : <X size={15} style={{ color: "#f87171", flexShrink: 0 }} />}
          <span style={{ fontSize: 13, color: t.type === "success" ? "#6ee7b7" : "#fca5a5" }}>{t.message}</span>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ─── Tiny shared styles ────────────────────────────────────────────────────

const S = {
  pill: { fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 999 },
  inputBase: { fontSize: 12, padding: "7px 10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, color: "rgba(255,255,255,0.7)", outline: "none" },
  formInput: { width: "100%", padding: "8px 10px", fontSize: 13, boxSizing: "border-box", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", outline: "none" },
  label: { display: "block", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 },
  btnCancel: { fontSize: 13, padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" },
};

// ─── Built-in cell renderers ───────────────────────────────────────────────

function CellAvatar({ row, col }) {
  const ac = avatarColor(row[col.key]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: ac.bg, color: ac.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
        {initials(row[col.key])}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{row[col.key]}</div>
        {col.subKey && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>@{row[col.subKey] || "user"}</div>}
      </div>
    </div>
  );
}

function CellBadge({ row, col }) {
  const val = row[col.key];
  const cm = col.colorMap?.[val];
  return (
    <span style={{ ...S.pill, background: cm?.bg || "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.05)", color: cm?.color || "rgba(255,255,255,0.7)", display: "inline-flex", alignItems: "center", gap: 5 }}>
      {cm?.dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: cm.color, flexShrink: 0 }} />}
      {val}
    </span>
  );
}

function CellText({ row, col }) {
  return <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{row[col.key] ?? "-"}</span>;
}

// ─── Overlay + Modal shell ─────────────────────────────────────────────────

function Overlay({ children, onClose }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(13,17,23,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, width: "100%", maxWidth: 420, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, titleColor, icon, onClose }) {
  return (
    <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        <span style={{ fontSize: 14, fontWeight: 500, color: titleColor || "#fff" }}>{title}</span>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex" }}><X size={15} /></button>
    </div>
  );
}

function ModalFooter({ onClose, onConfirm, loading, label, confirmBg, confirmColor }) {
  return (
    <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
      <button onClick={onClose} style={S.btnCancel}>Batal</button>
      <button onClick={onConfirm} disabled={loading}
        style={{ fontSize: 13, padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 500, background: confirmBg, color: confirmColor }}>
        {loading ? "Memproses…" : label}
      </button>
    </div>
  );
}

// ─── Modal Edit ────────────────────────────────────────────────────────────

function ModalEdit({ row, editFields, onClose, onSubmit }) {
  const initForm = Object.fromEntries(editFields.map(f => [f.key, String(row[f.key] ?? "").trim()]));
  const [form, setForm] = useState(initForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setLoading(true); setError("");
    try { await onSubmit(row.id, form); onClose(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menyimpan."); }
    finally { setLoading(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Edit data" icon={<Edit2 size={14} style={{ color: "rgba(255,255,255,0.6)" }} />} onClose={onClose} />
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {error && <div style={{ fontSize: 12, color: "#fca5a5", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px" }}>{error}</div>}
        {editFields.map(f => (
          <div key={f.key}>
            <label style={S.label}>{f.label}</label>
            {f.options ? (
              <select key={f.key + "_" + form[f.key]} defaultValue={String(form[f.key]).trim()} onChange={set(f.key)} style={{ ...S.formInput, color: "rgba(255,255,255,0.7)" }}>
                {f.options.map(o => {
                  const v = String(o.value ?? o).trim();
                  return <option key={v} value={v} style={{ background: "#161b27" }}>{o.label ?? o}</option>;
                })}
              </select>
            ) : (
              <input type={f.type || "text"} value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder || ""} style={S.formInput} />
            )}
          </div>
        ))}
      </div>
      <ModalFooter onClose={onClose} onConfirm={save} loading={loading} label="Simpan" confirmBg="rgba(255,255,255,0.1)" confirmColor="#fff" />
    </Overlay>
  );
}

// ─── Modal Delete ──────────────────────────────────────────────────────────

function ModalDelete({ row, labelKey = "name", subLabelKey, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ac = avatarColor(row[labelKey]);

  const del = async () => {
    setLoading(true); setError("");
    try { await onSubmit(row.id); onClose(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menghapus."); }
    finally { setLoading(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Hapus data" titleColor="#f87171" icon={<Trash2 size={14} style={{ color: "#f87171" }} />} onClose={onClose} />
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: ac.bg, color: ac.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
            {initials(row[labelKey])}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{row[labelKey]}</div>
            {subLabelKey && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{row[subLabelKey]}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <AlertTriangle size={14} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>Tindakan ini tidak bisa dibatalkan. Data akan dihapus permanen.</p>
        </div>
        {error && <div style={{ fontSize: 12, color: "#f87171" }}>{error}</div>}
      </div>
      <ModalFooter onClose={onClose} onConfirm={del} loading={loading} label="Ya, hapus" confirmBg="rgba(239,68,68,0.15)" confirmColor="#fca5a5" />
    </Overlay>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, total, perPage, onChange }) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const btn = active => ({
    minWidth: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, borderRadius: 7, cursor: "pointer",
    background: active ? "rgba(255,255,255,0.9)" : "transparent",
    color: active ? "#161b27" : "rgba(255,255,255,0.6)",
    border: active ? "none" : "1px solid rgba(255,255,255,0.1)",
    fontWeight: active ? 600 : 400
  });

  return (
    <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{start}–{end} dari {total}</span>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={() => onChange(page - 1)} disabled={page === 1} style={btn(false)}><ChevronLeft size={13} /></button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .map((p, i, arr) => (
            <React.Fragment key={p}>
              {arr[i - 1] && p - arr[i - 1] > 1 && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "0 4px", lineHeight: "30px" }}>…</span>}
              <button onClick={() => onChange(p)} style={btn(p === page)}>{p}</button>
            </React.Fragment>
          ))}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} style={btn(false)}><ChevronRight size={13} /></button>
      </div>
    </div>
  );
}

// ─── Modal Create ──────────────────────────────────────────────────────────

function ModalCreate({ createFields, onClose, onSubmit }) {
  const [form, setForm] = useState(Object.fromEntries(
    createFields.map(f => {
      if (f.options && f.options.length > 0) return [f.key, String(f.options[0].value ?? f.options[0]).trim()];
      return [f.key, f.default ?? ""];
    })
  ));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setLoading(true); setError("");
    try { await onSubmit(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || "Gagal menyimpan."); }
    finally { setLoading(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Tambah data" icon={<Plus size={14} style={{ color: "rgba(255,255,255,0.6)" }} />} onClose={onClose} />
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {error && <div style={{ fontSize: 12, color: "#fca5a5", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px" }}>{error}</div>}
        {createFields.map(f => (
          <div key={f.key}>
            <label style={S.label}>{f.label}{f.required !== false && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}</label>
            {f.options ? (
              <select key={f.key + "_" + form[f.key]} defaultValue={String(form[f.key]).trim()} onChange={set(f.key)} style={{ ...S.formInput, color: "rgba(255,255,255,0.7)" }}>
                {f.options.map(o => {
                  const v = String(o.value ?? o).trim();
                  return <option key={v} value={v} style={{ background: "#161b27" }}>{o.label ?? o}</option>;
                })}
              </select>
            ) : (
              <input type={f.type || "text"} value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder || ""} style={S.formInput} />
            )}
          </div>
        ))}
      </div>
      <ModalFooter onClose={onClose} onConfirm={save} loading={loading} label="Simpan" confirmBg="rgba(255,255,255,0.1)" confirmColor="#fff" />
    </Overlay>
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
  const [filters, setFilters] = useState(Object.fromEntries(filterFields.map(f => [f, "all"])));
  const [page, setPage] = useState(1);
  const [modalEdit, setModalEdit] = useState(null);
  const [modalDel, setModalDel] = useState(null);
  const [modalCreate, setModalCreate] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const searchKeys = searchFields || columns.map(c => c.key);

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

  const filterOptions = useMemo(() =>
    Object.fromEntries(filterFields.map(f => [f, [...new Set(rows.map(r => r[f]).filter(Boolean))]])),
    [rows, filterFields]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(row => {
      const matchSearch = !q || searchKeys.some(k => row[k]?.toLowerCase?.().includes(q));
      const matchFilters = filterFields.every(f => filters[f] === "all" || row[f] === filters[f]);
      return matchSearch && matchFilters;
    });
  }, [rows, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const hasFilter = search !== "" || filterFields.some(f => filters[f] !== "all");

  const clearFilters = () => {
    setSearch(""); setPage(1);
    setFilters(Object.fromEntries(filterFields.map(f => [f, "all"])));
  };

  const handleSetFilter = (f, v) => { setFilters(p => ({ ...p, [f]: v })); setPage(1); };

  const handleEdit = useCallback(async (id, body) => {
    if (onEdit) return onEdit(id, body);
    await axios.put(`${endpoint}/${id}`, body, { headers: authHeaders() });
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...body } : r));
    showToast("Data berhasil diperbarui");
  }, [endpoint, onEdit, showToast]);

  const handleDelete = useCallback(async (id) => {
    if (onDelete) return onDelete(id);
    await axios.delete(`${endpoint}/${id}`, { headers: authHeaders() });
    setRows(prev => prev.filter(r => r.id !== id));
    showToast("Data berhasil dihapus");
  }, [endpoint, onDelete, showToast]);

  const handleCreate = useCallback(async (body) => {
    if (onCreate) return onCreate(body);
    const res = await axios.post(endpoint, body, { headers: authHeaders() });
    const newRow = res.data?.data || res.data;
    setRows(prev => [newRow, ...prev]);
    showToast("Data berhasil ditambahkan");
  }, [endpoint, onCreate, showToast]);

  const showActions = editable || deletable;

  return (
    <div style={{ minHeight: "100%" }}>
      <Toast toasts={toasts} />
      {modalEdit && <ModalEdit row={modalEdit} editFields={editFields} onClose={() => setModalEdit(null)} onSubmit={handleEdit} />}
      {modalCreate && <ModalCreate createFields={createFields} onClose={() => setModalCreate(false)} onSubmit={handleCreate} />}
      {modalDel && <ModalDelete row={modalDel} labelKey={deleteLabelKey || columns[0]?.key || "name"} subLabelKey={deleteSubKey} onClose={() => setModalDel(null)} onSubmit={handleDelete} />}

      {/* Kontainer Utama */}
      <div style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{title}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 999, padding: "3px 10px" }}>
              {filtered.length}{hasFilter && filtered.length !== rows.length ? ` dari ${rows.length}` : ""} data
            </span>
            {creatable && (
              <button onClick={() => setModalCreate(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                <Plus size={13} /> Tambah
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        {(columns.length > 0 || filterFields.length > 0) && (
          <div style={{ padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.01)" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 160, maxWidth: 280 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", pointerEvents: "none" }} />
              <input type="text" placeholder="Cari…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ ...S.inputBase, width: "100%", paddingLeft: 30, boxSizing: "border-box" }} />
            </div>
            {filterFields.map(f => (
              <select key={f} value={filters[f]} onChange={e => handleSetFilter(f, e.target.value)} style={S.inputBase}>
                <option value="all" style={{ background: "#161b27" }}>Semua {f}</option>
                {(filterOptions[f] || []).map(v => <option key={v} value={v} style={{ background: "#161b27" }}>{v}</option>)}
              </select>
            ))}
            {hasFilter && (
              <button onClick={clearFilters} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 6 }}>
                <X size={12} /> Reset
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", width: 40 }}>#</th>
                {columns.map(col => (
                  <th key={col.key} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                    {col.label}
                  </th>
                ))}
                {showActions && (
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + 2} style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Memuat…</td></tr>
              ) : error ? (
                <tr><td colSpan={columns.length + 2} style={{ padding: 40, textAlign: "center", color: "#f87171", fontSize: 13 }}>{error}</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={columns.length + 2} style={{ padding: "48px 16px", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  Tidak ada data.{" "}
                  {hasFilter && <button onClick={clearFilters} style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Reset filter</button>}
                </td></tr>
              ) : (
                pageData.map((row, i) => (
                  <tr key={row.id ?? i}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{(safePage - 1) * perPage + i + 1}</td>
                    {columns.map(col => (
                      <td key={col.key} style={{ padding: "12px 16px" }}>
                        {col.render ? col.render(row) :
                          col.type === "avatar" ? <CellAvatar row={row} col={col} /> :
                            col.type === "badge" ? <CellBadge row={row} col={col} /> :
                              <CellText row={row} col={col} />}
                      </td>
                    ))}
                    {showActions && (
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {editable && (
                            <button onClick={() => setModalEdit(row)}
                              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "5px 10px", borderRadius: 7, cursor: "pointer", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", transition: "background 0.2s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                            ><Edit2 size={11} /> Edit</button>
                          )}
                          {deletable && (
                            <button onClick={() => setModalDel(row)}
                              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "5px 10px", borderRadius: 7, cursor: "pointer", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", transition: "background 0.2s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
                              onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                            ><Trash2 size={11} /> Hapus</button>
                          )}
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