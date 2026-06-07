import { useState } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";

export default function HasilPertandingan() {
  const [hasil, setHasil] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    jadwal_id: "",
    skor_tim_1: "",
    skor_tim_2: "",
    tim_pemenang_id: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Call API to save hasil
    console.log("Submit hasil:", formData);
    setShowForm(false);
    setFormData({
      jadwal_id: "",
      skor_tim_1: "",
      skor_tim_2: "",
      tim_pemenang_id: "",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Hasil Pertandingan</h1>
        <button
          onClick={() => setShowForm(!showForm)}
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

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Tim Pemenang (Optional)
              </label>
              <select
                name="tim_pemenang_id"
                value={formData.tim_pemenang_id}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Pilih Tim / Seri</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
                  <td className="px-6 py-3 text-white">{h.tim_1} vs {h.tim_2}</td>
                  <td className="px-6 py-3 text-white font-semibold">
                    {h.skor_tim_1} - {h.skor_tim_2}
                  </td>
                  <td className="px-6 py-3 text-slate-300">
                    {h.tim_pemenang ? h.tim_pemenang : "Seri"}
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="p-1 hover:bg-slate-700 rounded transition text-yellow-400">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-1 hover:bg-slate-700 rounded transition text-red-400">
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
