import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { eventApi } from "@/data/services";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama_event: "",
    deskripsi: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    lokasi: "",
    kuota_tim: "",
    biaya_pendaftaran: "",
    status: "draft",
  });

  // Fetch events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await eventApi.getAll();
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      alert("Gagal memuat events");
    } finally {
      setLoading(false);
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
      // Update event
      try {
        const response = await eventApi.update(editingId, formData);
        if (response.data.success) {
          alert("Event berhasil diperbarui");
          loadEvents();
          resetForm();
        }
      } catch (error) {
        console.error("Error updating event:", error);
        alert("Gagal memperbarui event");
      }
    } else {
      // Create event
      try {
        const response = await eventApi.create(formData);
        if (response.data.success) {
          alert("Event berhasil dibuat");
          loadEvents();
          resetForm();
        }
      } catch (error) {
        console.error("Error creating event:", error);
        alert("Gagal membuat event");
      }
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setFormData({
      nama_event: event.nama_event,
      deskripsi: event.deskripsi,
      tanggal_mulai: event.tanggal_mulai?.split('T')[0] || "",
      tanggal_selesai: event.tanggal_selesai?.split('T')[0] || "",
      lokasi: event.lokasi,
      kuota_tim: event.kuota_tim,
      biaya_pendaftaran: event.biaya_pendaftaran,
      status: event.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus event ini?")) {
      try {
        const response = await eventApi.delete(id);
        if (response.data.success) {
          alert("Event berhasil dihapus");
          loadEvents();
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Gagal menghapus event");
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      nama_event: "",
      deskripsi: "",
      tanggal_mulai: "",
      tanggal_selesai: "",
      lokasi: "",
      kuota_tim: "",
      biaya_pendaftaran: "",
      status: "draft",
    });
  };

  if (loading && events.length === 0) {
    return <div className="text-center py-8 text-white">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Manajemen Event</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Tambah Event
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nama Event
                </label>
                <input
                  type="text"
                  name="nama_event"
                  value={formData.nama_event}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
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
                  <option value="draft">Draft</option>
                  <option value="aktif">Aktif</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-24"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  name="tanggal_mulai"
                  value={formData.tanggal_mulai}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  name="tanggal_selesai"
                  value={formData.tanggal_selesai}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Lokasi
              </label>
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Kuota Tim
                </label>
                <input
                  type="number"
                  name="kuota_tim"
                  value={formData.kuota_tim}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Biaya Pendaftaran
                </label>
                <input
                  type="number"
                  name="biaya_pendaftaran"
                  value={formData.biaya_pendaftaran}
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
                Nama Event
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                Tanggal
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
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Tidak ada data event
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-700/50 transition">
                  <td className="px-6 py-3 text-white">{event.nama_event}</td>
                  <td className="px-6 py-3 text-slate-300">
                    {new Date(event.tanggal_mulai).toLocaleDateString()} s/d{" "}
                    {new Date(event.tanggal_selesai).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-slate-300">{event.lokasi}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === "aktif"
                          ? "bg-green-500/20 text-green-400"
                          : event.status === "selesai"
                          ? "bg-slate-500/20 text-slate-300"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="p-1 hover:bg-slate-700 rounded transition text-blue-400">
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-1 hover:bg-slate-700 rounded transition text-yellow-400"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
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

