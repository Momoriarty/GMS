import { useState, useEffect } from "react";
import { auditLogApi, userApi } from "@/data/services";

const ACTION_COLORS = {
  create: "badge-success",
  update: "badge-warning",
  delete: "badge-error",
  login: "badge-info",
  logout: "badge-neutral",
};

const ACTION_LABELS = {
  create: "Buat",
  update: "Ubah",
  delete: "Hapus",
  login: "Masuk",
  logout: "Keluar",
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
    loadUsers();
  }, []);

  const loadLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        per_page: 10,
      };
      if (selectedUser) params.user_id = selectedUser;
      if (selectedAction) params.aksi = selectedAction;

      const response = await auditLogApi.getAll(params);
      if (response.data.success) {
        setLogs(response.data.data);
        setTotalPages(response.data.last_page || 1);
        setCurrentPage(response.data.current_page || 1);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
      alert("Gagal memuat log audit");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userApi.getAll();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    loadLogs(1);
  };

  const getActionColor = (action) => ACTION_COLORS[action] || "badge-ghost";
  const getActionLabel = (action) => ACTION_LABELS[action] || action;

  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <span className="loading loading-dots loading-md text-base-content/30" />
        <p className="text-xs text-base-content/30">Memuat data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-1 text-base-content">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content">Log Audit</h1>
        <p className="text-base-content/60 mt-1">Riwayat aktivitas sistem</p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5 bg-base-200 border border-base-content/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2">
            Filter Pengguna
          </label>
          <select
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setTimeout(handleFilterChange, 100);
            }}
            className="select select-bordered select-sm w-full"
          >
            <option value="">-- Semua Pengguna --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2">
            Filter Aksi
          </label>
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setTimeout(handleFilterChange, 100);
            }}
            className="select select-bordered select-sm w-full"
          >
            <option value="">-- Semua Aksi --</option>
            <option value="create">Buat</option>
            <option value="update">Ubah</option>
            <option value="delete">Hapus</option>
            <option value="login">Masuk</option>
            <option value="logout">Keluar</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden bg-base-200 border border-base-content/5">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-base-300/30">
              <th className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
                Waktu
              </th>
              <th className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
                Pengguna
              </th>
              <th className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
                Tabel
              </th>
              <th className="text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-10 text-center text-sm text-base-content/40"
                >
                  Tidak ada log aktivitas
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-base-300/20 transition-colors border-b border-base-content/[0.04] last:border-0"
                >
                  <td className="text-sm text-base-content/70">
                    {new Date(log.created_at).toLocaleString("id-ID")}
                  </td>
                  <td className="text-sm font-medium text-base-content">
                    {log.user?.name}
                  </td>
                  <td className="text-sm font-mono text-base-content/60">
                    {log.tabel}
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm font-medium ${getActionColor(log.aksi)}`}
                    >
                      {getActionLabel(log.aksi)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
              loadLogs(currentPage - 1);
            }
          }}
          disabled={currentPage === 1}
          className="btn btn-sm btn-ghost"
        >
          Sebelumnya
        </button>
        <span className="px-4 py-2 text-sm text-base-content/70">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => {
            if (currentPage < totalPages) {
              setCurrentPage(currentPage + 1);
              loadLogs(currentPage + 1);
            }
          }}
          disabled={currentPage === totalPages}
          className="btn btn-sm btn-ghost"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}