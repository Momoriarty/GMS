import { useState, useEffect } from "react";
import { auditLogApi, userApi } from "@/data/services";

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

  const getActionColor = (action) => {
    switch (action) {
      case "create":
        return "bg-green-500/20 text-green-400";
      case "update":
        return "bg-blue-500/20 text-blue-400";
      case "delete":
        return "bg-red-500/20 text-red-400";
      case "login":
        return "bg-cyan-500/20 text-cyan-400";
      case "logout":
        return "bg-slate-500/20 text-slate-300";
      default:
        return "bg-slate-500/20 text-slate-300";
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      create: "Buat",
      update: "Ubah",
      delete: "Hapus",
      login: "Masuk",
      logout: "Keluar",
    };
    return labels[action] || action;
  };

  if (loading && logs.length === 0) {
    return <div className="text-center py-8 text-white">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Log Audit</h1>
        <p className="text-slate-400 mt-2">Riwayat aktivitas sistem</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Filter Pengguna
          </label>
          <select
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setTimeout(handleFilterChange, 100);
            }}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Semua Pengguna --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Filter Aksi
          </label>
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setTimeout(handleFilterChange, 100);
            }}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Waktu
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Pengguna
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Tabel
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Tidak ada log aktivitas
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/50 transition">
                  <td className="px-6 py-3 text-slate-300 text-sm">
                    {new Date(log.created_at).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-3 text-white">{log.user?.name}</td>
                  <td className="px-6 py-3 text-slate-300 font-mono text-sm">
                    {log.tabel}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.aksi)}`}>
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
          className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm"
        >
          Sebelumnya
        </button>
        <span className="px-4 py-2 text-white">
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
          className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
