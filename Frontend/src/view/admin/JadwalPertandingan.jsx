import { useState } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";

export default function JadwalPertandingan() {
  const [jadwal, setJadwal] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    event_id: "",
    tim_1_id: "",
    tim_2_id: "",
    waktu_pertandingan: "",
    lokasi_lapangan: "",
    status: "terjadwal",
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
    // TODO: Call API to save jadwal
    console.log("Submit jadwal:", formData);
    setShowForm(false);
    setFormData({
      event_id: "",
      tim_1_id: "",
      tim_2_id: "",
      waktu_pertandingan: "",
      lokasi_lapangan: "",
      status: "terjadwal",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Jadwal Pertandingan</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Tambah Jadwal
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Event
                </label>
                <select
                  name="event_id"
                  value={formData.event_id}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Event</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="terjadwal">Terjadwal</option>
                  <option value="berlangsung">Berlangsung</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tim 1
                </label>
                <select
                  name="tim_1_id"
                  value={formData.tim_1_id}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Tim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tim 2
                </label>
                <select
                  name="tim_2_id"
                  value={formData.tim_2_id}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Pilih Tim</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Waktu Pertandingan
                </label>
                <input
                  type="datetime-local"
                  name="waktu_pertandingan"
                  value={formData.waktu_pertandingan}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Lokasi Lapangan
                </label>
                <input
                  type="text"
                  name="lokasi_lapangan"
                  value={formData.lokasi_lapangan}
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
                Tim 1 vs Tim 2
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Waktu
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Lokasi
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {jadwal.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Tidak ada data jadwal
                </td>
              </tr>
            ) : (
              jadwal.map((j) => (
                <tr key={j.id} className="hover:bg-slate-700/50 transition">
                  <td className="px-6 py-3 text-white">{j.tim_1} vs {j.tim_2}</td>
                  <td className="px-6 py-3 text-slate-300">{j.waktu_pertandingan}</td>
                  <td className="px-6 py-3 text-slate-300">{j.lokasi_lapangan}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        j.status === "selesai"
                          ? "bg-slate-500/20 text-slate-300"
                          : j.status === "berlangsung"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="p-1 hover:bg-slate-700 rounded transition text-blue-400">
                      <Eye size={18} />
                    </button>
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
