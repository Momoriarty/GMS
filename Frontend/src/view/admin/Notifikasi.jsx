import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { notifikasiApi, userApi } from "@/data/services";

export default function Notifikasi() {
  const [notifikasi, setNotifikasi] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    judul: "",
    pesan: "",
    tipe: "umum",
  });

  useEffect(() => {
    loadNotifikasi();
    loadUsers();
  }, []);

  const loadNotifikasi = async () => {
    setLoading(true);
    try {
      const response = await notifikasiApi.getAll();
      if (response.data.success) {
        setNotifikasi(response.data.data);
      }
    } catch (error) {
      console.error("Error loading notifikasi:", error);
      alert("Gagal memuat notifikasi");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await notifikasiApi.create(formData);
      if (response.data.success) {
        alert("Notifikasi berhasil dikirim");
        loadNotifikasi();
        resetForm();
      }
    } catch (error) {
      console.error("Error sending notifikasi:", error);
      alert("Gagal mengirim notifikasi");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus notifikasi ini?")) {
      try {
        const response = await notifikasiApi.delete(id);
        if (response.data.success) {
          alert("Notifikasi berhasil dihapus");
          loadNotifikasi();
        }
      } catch (error) {
        console.error("Error deleting notifikasi:", error);
        alert("Gagal menghapus notifikasi");
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      user_id: "",
      judul: "",
      pesan: "",
      tipe: "umum",
    });
  };

  if (loading && notifikasi.length === 0) {
    return <div className="text-center py-8 text-white">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Notifikasi</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Kirim Notifikasi
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Penerima
                </label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Penerima</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tipe Notifikasi
                </label>
                <select
                  name="tipe"
                  value={formData.tipe}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="umum">Umum</option>
                  <option value="pendaftaran">Pendaftaran</option>
                  <option value="jadwal">Jadwal</option>
                  <option value="hasil">Hasil</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Judul
              </label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Pesan
              </label>
              <textarea
                name="pesan"
                value={formData.pesan}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-24"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
              >
                Kirim
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {notifikasi.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400 border border-slate-700">
            Tidak ada notifikasi
          </div>
        ) : (
          notifikasi.map((n) => (
            <div
              key={n.id}
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{n.judul}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                      {n.tipe}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{n.pesan}</p>
                  <p className="text-xs text-slate-500">
                    Ke: {n.user?.name} • {new Date(n.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1 hover:bg-slate-700 rounded transition text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
