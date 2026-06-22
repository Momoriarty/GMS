import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { notifikasiApi, userApi } from "@/data/services";

export default function Notifikasi() {
  const [notifikasi, setNotifikasi] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
      console.error(error);
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
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔥 CREATE (optimistic + fallback)
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const response = await notifikasiApi.create(formData);

    // ambil data dari backend kalau ada
    const data = response?.data?.data;

    setNotifikasi((prev) => [
      {
        id: data?.id || Date.now(),
        judul: `Farhan mengirim notifikasi`,
        pesan: formData.pesan,
        tipe: formData.tipe,
        user: { name: "Farhan" },
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);

    alert("Notifikasi berhasil dikirim");
    resetForm();
  } catch (error) {
    console.error(error);
    alert("Gagal mengirim notifikasi");
  } finally {
    setSubmitting(false);
  }
};

  // 🔥 DELETE (optimistic update)
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus notifikasi ini?")) return;

    // 🔥 langsung hapus di UI dulu
    const oldData = notifikasi;
    setNotifikasi((prev) => prev.filter((n) => n.id !== id));

    try {
      const response = await notifikasiApi.delete(id);

      if (response.data.success) {
        alert("Notifikasi berhasil dihapus");
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus, rollback data");

      // rollback kalau gagal
      setNotifikasi(oldData);
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
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={20} />
          Kirim Notifikasi
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">

            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleInputChange}
              className="w-full bg-slate-700 p-2 rounded text-white"
              required
            >
              <option value="">Pilih Penerima</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <input
              name="judul"
              value={formData.judul}
              onChange={handleInputChange}
              placeholder="Judul"
              className="w-full bg-slate-700 p-2 rounded text-white"
              required
            />

            <textarea
              name="pesan"
              value={formData.pesan}
              onChange={handleInputChange}
              placeholder="Pesan"
              className="w-full bg-slate-700 p-2 rounded text-white h-24"
              required
            />

            <div className="flex gap-2">
              <button
                disabled={submitting}
                className="flex-1 bg-blue-600 py-2 rounded text-white"
              >
                {submitting ? "Mengirim..." : "Kirim"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-slate-700 py-2 rounded text-white"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {notifikasi.length === 0 ? (
          <div className="text-center text-slate-400">
            Tidak ada notifikasi
          </div>
        ) : (
          notifikasi.map((n) => (
            <div
              key={n.id}
              className="bg-slate-800 p-4 rounded-lg border border-slate-700"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-white font-semibold">{n.judul}</h3>
                  <p className="text-slate-400 text-sm">{n.pesan}</p>
                  <p className="text-xs text-slate-500">
                    Ke: {n.user?.name}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(n.id)}
                  className="text-red-400 hover:text-red-300"
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