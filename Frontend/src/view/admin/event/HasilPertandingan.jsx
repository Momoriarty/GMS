import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { hasilApi, jadwalApi } from "@/data/services";

export default function HasilPertandingan() {
  const [hasil, setHasil] = useState([]);
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    jadwal_id: "",
    skor_tim_1: "",
    skor_tim_2: "",
    tim_pemenang_id: "",
  });

  useEffect(() => {
    loadHasil();
    loadJadwal();
  }, []);

  const loadHasil = async () => {
    setLoading(true);
    try {
      const response = await hasilApi.getAll();
      if (response.data.success) {
        setHasil(response.data.data);
      }
    } catch (error) {
      console.error("Error loading hasil:", error);
      alert("Gagal memuat hasil pertandingan");
    } finally {
      setLoading(false);
    }
  };

  const loadJadwal = async () => {
    try {
      const response = await jadwalApi.getAll({ status: "berlangsung" });
      if (response.data.success) {
        setJadwal(response.data.data);
      }
    } catch (error) {
      console.error("Error loading jadwal:", error);
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
    
    if (editingId) {
      try {
        const response = await hasilApi.update(editingId, formData);
        if (response.data.success) {
          alert("Hasil berhasil diperbarui");
          loadHasil();
          resetForm();
        }
      } catch (error) {
        console.error("Error updating hasil:", error);
        alert("Gagal memperbarui hasil");
      }
    } else {
      try {
        const response = await hasilApi.create(formData);
        if (response.data.success) {
          alert("Hasil berhasil disimpan");
          loadHasil();
          resetForm();
        }
      } catch (error) {
        console.error("Error creating hasil:", error);
        alert("Gagal menyimpan hasil");
      }
    }
  };

  const handleEdit = (h) => {
    setEditingId(h.id);
    setFormData({
      jadwal_id: h.jadwal_id,
      skor_tim_1: h.skor_tim_1,
      skor_tim_2: h.skor_tim_2,
      tim_pemenang_id: h.tim_pemenang_id || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus hasil ini?")) {
      try {
        const response = await hasilApi.delete(id);
        if (response.data.success) {
          alert("Hasil berhasil dihapus");
          loadHasil();
        }
      } catch (error) {
        console.error("Error deleting hasil:", error);
        alert("Gagal menghapus hasil");
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      jadwal_id: "",
      skor_tim_1: "",
      skor_tim_2: "",
      tim_pemenang_id: "",
    });
  };

  if (loading && hasil.length === 0) {
    return <div className="text-center py-8 text-white">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Hasil Pertandingan</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Input Hasil
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Jadwal Pertandingan
              </label>
              <select
                name="jadwal_id"
                value={formData.jadwal_id}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Pilih Jadwal</option>
                {jadwal.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.tim1?.nama_tim} vs {j.tim2?.nama_tim}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Skor Tim 1
                </label>
                <input
                  type="number"
                  name="skor_tim_1"
                  value={formData.skor_tim_1}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Skor Tim 2
                </label>
                <input
                  type="number"
                  name="skor_tim_2"
                  value={formData.skor_tim_2}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
              >
                {editingId ? "Update" : "Simpan"}
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

      {/* Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Pertandingan
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Skor
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Pemenang
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {hasil.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Tidak ada data hasil pertandingan
                </td>
              </tr>
            ) : (
              hasil.map((h) => (
                <tr key={h.id} className="hover:bg-slate-700/50 transition">
                  <td className="px-6 py-3 text-white">
                    {h.jadwal?.tim1?.nama_tim} vs {h.jadwal?.tim2?.nama_tim}
                  </td>
                  <td className="px-6 py-3 text-white font-semibold">
                    {h.skor_tim_1} - {h.skor_tim_2}
                  </td>
                  <td className="px-6 py-3 text-slate-300">
                    {h.tim_pemenang ? h.tim_pemenang.nama_tim : "Seri"}
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(h)}
                      className="p-1 hover:bg-slate-700 rounded transition text-yellow-400"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="p-1 hover:bg-slate-700 rounded transition text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
