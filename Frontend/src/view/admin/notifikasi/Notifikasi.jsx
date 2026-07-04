import { useState, useEffect } from "react";
import { Plus, Trash2, Bell } from "lucide-react";
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
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-base-content">Notifikasi</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-sm btn-neutral gap-2"
        >
          <Plus size={16} />
          Kirim Notifikasi
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="rounded-2xl p-5 bg-base-200 border border-base-content/5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleInputChange}
              className="select select-bordered select-sm w-full"
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
              className="input input-bordered input-sm w-full"
              required
            />

            <textarea
              name="pesan"
              value={formData.pesan}
              onChange={handleInputChange}
              placeholder="Pesan"
              className="textarea textarea-bordered w-full h-24"
              required
            />

            <div className="flex gap-2 pt-1">
              <button
                disabled={submitting}
                className="btn btn-sm btn-neutral flex-1"
              >
                {submitting && (
                  <span className="loading loading-spinner loading-xs" />
                )}
                {submitting ? "Mengirim…" : "Kirim"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="btn btn-sm btn-ghost flex-1"
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
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center">
              <Bell size={22} className="text-base-content/30" />
            </div>
            <p className="text-sm font-medium text-base-content/50">
              Tidak ada notifikasi
            </p>
          </div>
        ) : (
          notifikasi.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl p-4 bg-base-200 border border-base-content/5"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-base-content">
                    {n.judul}
                  </h3>
                  <p className="text-sm text-base-content/60 mt-0.5">
                    {n.pesan}
                  </p>
                  <p className="text-xs text-base-content/40 mt-1.5">
                    Ke: {n.user?.name}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(n.id)}
                  className="btn btn-xs btn-ghost text-error/60 hover:text-error hover:bg-error/10 shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}