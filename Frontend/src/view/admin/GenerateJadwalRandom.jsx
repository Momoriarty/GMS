import { useState } from "react";
import { useParams } from "react-router-dom";
import { generateSchedule } from "../../utils/scheduleGenerator";

const API_BASE = "http://127.0.0.1:8000/api";

export default function GenerateJadwalRandom() {
  const { id, timId } = useParams(); // Both params, even if timId is not used
  const [minPertandingan, setMinPertandingan] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (minPertandingan < 1) {
      setMessageType("error");
      setMessage("Minimum pertandingan harus minimal 1x");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // 1. Ambil data event
      const eventRes = await fetch(`${API_BASE}/events/${id}`, { headers });
      const eventJson = await eventRes.json();
      const event = eventJson?.data || eventJson;

      if (!event || !event.id) {
        setMessageType("error");
        setMessage("Event tidak ditemukan");
        setLoading(false);
        return;
      }

      // 2. Ambil tim yang terdaftar dan diterima
      const pendaftaranRes = await fetch(
        `${API_BASE}/pendaftaran?event_id=${id}&status=diterima`,
        { headers }
      );
      const pendaftaranJson = await pendaftaranRes.json();
      const pendaftaranList = Array.isArray(pendaftaranJson?.data)
        ? pendaftaranJson.data
        : Array.isArray(pendaftaranJson)
        ? pendaftaranJson
        : [];

      // Extract teams dari pendaftaran dan user tim
      const teams = pendaftaranList
        .map((p, idx) => {
          console.log(`Pendaftaran ${idx}:`, {
            user: p.user?.name,
            tim: p.user?.tim?.nama_tim,
            kelompok_umur: p.user?.tim?.kelompok_umur
          });
          return {
            user: p.user,
            tim: p.user?.tim
          };
        })
        .filter(p => p.tim) // Filter hanya yang punya tim
        .map(p => ({
          id: p.tim.id,
          nama_tim: p.tim.nama_tim,
          kelompok_umur: p.tim.kelompok_umur
        }));

      console.log('Pendaftaran yang diterima:', pendaftaranList);
      console.log('Teams extracted:', teams);
      console.log('Total teams:', teams.length);

      if (teams.length < 2) {
        setMessageType("error");
        setMessage("Minimal 2 tim yang diterima dibutuhkan untuk generate jadwal");
        setLoading(false);
        return;
      }

      // 3. Generate jadwal di frontend
      const result = generateSchedule(teams, event, minPertandingan);

      console.log('Generate result:', result);
      if (result.data && result.data.length > 0) {
        // Count jadwal per tim
        const timJadwalCount = {};
        result.data.forEach(jadwal => {
          timJadwalCount[jadwal.tim_1_id] = (timJadwalCount[jadwal.tim_1_id] || 0) + 1;
          timJadwalCount[jadwal.tim_2_id] = (timJadwalCount[jadwal.tim_2_id] || 0) + 1;
        });
        console.log('Jadwal per tim:', timJadwalCount);
        console.log('Teams yang dapat jadwal:', Object.keys(timJadwalCount).length);
        console.log('Teams total:', teams.length);
      }

      if (result.success) {
        setPreviewData(result);
        setShowPreview(true);
        setMessageType("success");
        setMessage("Jadwal berhasil di-generate. Silakan review sebelum menyimpan.");
      } else {
        setMessageType("error");
        setMessage(result.message);
      }
    } catch (err) {
      setMessageType("error");
      setMessage("Terjadi kesalahan: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!previewData || !previewData.data || previewData.data.length === 0) {
      setMessageType("error");
      setMessage("Tidak ada jadwal untuk disimpan");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Kirim jadwal yang sudah di-generate ke backend untuk disimpan
      const res = await fetch(`${API_BASE}/jadwal-pertandingan/bulk-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jadwal_list: previewData.data
        }),
      });

      const json = await res.json();

      if (json.success) {
        setMessageType("success");
        setMessage(`${json.message || previewData.data.length + ' jadwal berhasil disimpan'}`);
        setShowPreview(false);
        setPreviewData(null);

        // Reload halaman setelah berhasil save
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(json.message || "Gagal menyimpan jadwal");
      }
    } catch (err) {
      setMessageType("error");
      setMessage("Terjadi kesalahan: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
    setPreviewData(null);
    setMessageType("info");
    setMessage("Generate jadwal dibatalkan");
  };

  return (
    <>
      {/* Form Generate */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4">Generate Jadwal Pertandingan Random</h2>

          {/* Alert Message */}
          {message && !showPreview && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                messageType === "success"
                  ? "bg-green-100 border border-green-300 text-green-700"
                  : messageType === "error"
                  ? "bg-red-100 border border-red-300 text-red-700"
                  : "bg-blue-100 border border-blue-300 text-blue-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-4">
            {/* Minimum Pertandingan Per Tim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Pertandingan Per Tim
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setMinPertandingan(Math.max(1, minPertandingan - 1))
                  }
                  disabled={loading || minPertandingan <= 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={minPertandingan}
                  onChange={(e) =>
                    setMinPertandingan(parseInt(e.target.value) || 1)
                  }
                  disabled={loading}
                  className="w-20 text-center px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  onClick={() => setMinPertandingan(minPertandingan + 1)}
                  disabled={loading}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  +
                </button>
                <span className="text-sm text-gray-600">kali</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Setiap tim akan bermain minimal jumlah yang dipilih untuk setiap
                kelompok umur.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-2">Cara Kerja:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Sistem akan mengambil semua tim terdaftar dengan kelompok umur
                  mereka
                </li>
                <li>Membuat kombinasi pertandingan secara acak untuk setiap kelompok umur</li>
                <li>Memastikan setiap tim bermain minimal sesuai jumlah yang dipilih</li>
                <li>Tidak ada tim yang melawan dirinya sendiri</li>
                <li>Jadwal akan ditampilkan untuk review sebelum disimpan</li>
              </ul>
            </div>

            {/* Button */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Memproses..." : "Generate Jadwal Random"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Preview Jadwal Pertandingan</h2>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Total Pertandingan</p>
                <p className="text-2xl font-bold text-blue-600">
                  {previewData.total_matches}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600">Kelompok Umur</p>
                <p className="text-lg font-bold text-purple-600">
                  {previewData.age_groups?.join(", ")}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-600">Min Pertandingan/Tim</p>
                <p className="text-2xl font-bold text-orange-600">
                  {previewData.min_pertandingan}x
                </p>
              </div>
            </div>

            {/* Jadwal List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Daftar Pertandingan</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {previewData.data?.map((jadwal, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div>
                        <p className="text-sm text-gray-600">Tim 1</p>
                        <p className="font-semibold">
                          {jadwal.tim_1_nama}{" "}
                          <span className="text-xs text-gray-500">
                            ({jadwal.tim_1_kelompok_umur})
                          </span>
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-400">vs</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tim 2</p>
                        <p className="font-semibold">
                          {jadwal.tim_2_nama}{" "}
                          <span className="text-xs text-gray-500">
                            ({jadwal.tim_2_kelompok_umur})
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Waktu</p>
                        <p className="font-semibold text-sm">
                          {new Date(jadwal.waktu_pertandingan).toLocaleString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Lokasi</p>
                        <p className="font-semibold text-sm">
                          {jadwal.lokasi_lapangan}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium disabled:opacity-50 transition"
              >
                {loading ? "Memproses..." : "Cancel"}
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 transition"
              >
                {loading ? "Menyimpan..." : "Simpan Jadwal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

