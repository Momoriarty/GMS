import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { jadwalApi, eventApi, timApi } from "@/data/services";

export default function JadwalPertandingan() {
  const [jadwal, setJadwal] = useState([]);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [formData, setFormData] = useState({
    event_id: "",
    tim_1_id: "",
    tim_2_id: "",
    waktu_pertandingan: "",
    lokasi_lapangan: "",
    status: "terjadwal",
  });

  useEffect(() => {
    loadJadwal();
    loadEvents();
    loadTeams();
  }, []);

  const loadJadwal = async () => {
    setLoading(true);
    try {
      const response = await jadwalApi.getAll(selectedEvent ? { event_id: selectedEvent } : {});
      if (response.data.success) {
        setJadwal(response.data.data);
      }
    } catch (error) {
      console.error("Error loading jadwal:", error);
      alert("Gagal memuat jadwal");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await eventApi.getAll();
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await timApi.getAll();
      if (response.data.success) {
        setTeams(response.data.data);
      }
    } catch (error) {
      console.error("Error loading teams:", error);
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
        const response = await jadwalApi.update(editingId, formData);
        if (response.data.success) {
          alert("Jadwal berhasil diperbarui");
          loadJadwal();
          resetForm();
        }
      } catch (error) {
        console.error("Error updating jadwal:", error);
        alert("Gagal memperbarui jadwal");
      }
    } else {
      try {
        const response = await jadwalApi.create(formData);
        if (response.data.success) {
          alert("Jadwal berhasil dibuat");
          loadJadwal();
          resetForm();
        }
      } catch (error) {
        console.error("Error creating jadwal:", error);
        alert("Gagal membuat jadwal");
      }
    }
  };

  const handleEdit = (j) => {
    setEditingId(j.id);
    setFormData({
      event_id: j.event_id,
      tim_1_id: j.tim_1_id,
      tim_2_id: j.tim_2_id,
      waktu_pertandingan: j.waktu_pertandingan?.slice(0, 16) || "",
      lokasi_lapangan: j.lokasi_lapangan,
      status: j.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus jadwal ini?")) {
      try {
        const response = await jadwalApi.delete(id);
        if (response.data.success) {
          alert("Jadwal berhasil dihapus");
          loadJadwal();
        }
      } catch (error) {
        console.error("Error deleting jadwal:", error);
        alert("Gagal menghapus jadwal");
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      event_id: "",
      tim_1_id: "",
      tim_2_id: "",
      waktu_pertandingan: "",
      lokasi_lapangan: "",
      status: "terjadwal",
    });
  };

  if (loading && jadwal.length === 0) {
    return <div className="text-center py-8 text-white">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Jadwal Pertandingan</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Tambah Jadwal
        </button>
      </div>

      {/* Filter */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <select
          value={selectedEvent}
          onChange={(e) => {
            setSelectedEvent(e.target.value);
            if (e.target.value) {
              jadwalApi.getAll({ event_id: e.target.value }).then(res => {
                if (res.data.success) setJadwal(res.data.data);
              });
            } else {
              loadJadwal();
            }
          }}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
        >
          <option value="">-- Semua Event --</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.nama_event}</option>
          ))}
        </select>
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
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.nama_event}</option>
                  ))}
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
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.nama_tim}</option>
                  ))}
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
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.nama_tim}</option>
                  ))}
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
                  <td className="px-6 py-3 text-white">
                    {j.tim1?.nama_tim} vs {j.tim2?.nama_tim}
                  </td>
                  <td className="px-6 py-3 text-slate-300">
                    {new Date(j.waktu_pertandingan).toLocaleString("id-ID")}
                  </td>
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
                    <button
                      onClick={() => handleEdit(j)}
                      className="p-1 hover:bg-slate-700 rounded transition text-yellow-400"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(j.id)}
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
