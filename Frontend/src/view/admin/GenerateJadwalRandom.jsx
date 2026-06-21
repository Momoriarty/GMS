import { useState } from "react";
import { useParams } from "react-router-dom";
import { generateSchedule } from "../../utils/scheduleGenerator";

const API_BASE = "http://127.0.0.1:8000/api";

export default function GenerateJadwalRandom() {
  const { id, timId } = useParams();
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

      const eventRes = await fetch(`${API_BASE}/events/${id}`, { headers });
      const eventJson = await eventRes.json();
      const event = eventJson?.data || eventJson;

      if (!event || !event.id) {
        setMessageType("error");
        setMessage("Event tidak ditemukan");
        setLoading(false);
        return;
      }

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

      const teams = pendaftaranList
        .map((p) => ({ user: p.user, tim: p.user?.tim }))
        .filter((p) => p.tim)
        .map((p) => ({
          id: p.tim.id,
          nama_tim: p.tim.nama_tim,
          kelompok_umur: p.tim.kelompok_umur,
        }));

      if (teams.length < 2) {
        setMessageType("error");
        setMessage("Minimal 2 tim yang diterima dibutuhkan untuk generate jadwal");
        setLoading(false);
        return;
      }

      const result = generateSchedule(teams, event, minPertandingan);

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
    if (!previewData?.data?.length) {
      setMessageType("error");
      setMessage("Tidak ada jadwal untuk disimpan");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/jadwal-pertandingan/bulk-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jadwal_list: previewData.data }),
      });

      const json = await res.json();

      if (json.success) {
        setMessageType("success");
        setMessage(json.message || `${previewData.data.length} jadwal berhasil disimpan`);
        setShowPreview(false);
        setPreviewData(null);
        setTimeout(() => window.location.reload(), 1500);
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

  const alertClass = {
    success: "alert alert-success",
    error: "alert alert-error",
    info: "alert alert-info",
  }[messageType] || "alert";

  return (
    <>
      {/* Form Card */}
      <div className="card bg-base-100 border border-base-200 shadow-none mb-6">
        <div className="card-body p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">Generate Jadwal Pertandingan</h2>
              <p className="text-xs text-base-content/50 mt-0.5">Buat jadwal secara acak per kelompok umur</p>
            </div>
          </div>

          <div className="divider my-0 mb-5" />

          {/* Alert */}
          {message && !showPreview && (
            <div className={`${alertClass} mb-4 text-sm py-3`}>
              <span>{message}</span>
            </div>
          )}

          {/* Min Pertandingan */}
          <div className="mb-5">
            <label className="label pb-2">
              <span className="label-text text-xs font-medium uppercase tracking-wide text-base-content/50">
                Minimum pertandingan per tim
              </span>
            </label>
            <div className="flex items-center gap-3">
              <button
                className="btn btn-sm btn-ghost border border-base-300"
                onClick={() => setMinPertandingan(Math.max(1, minPertandingan - 1))}
                disabled={loading || minPertandingan <= 1}
              >
                −
              </button>
              <span className="text-2xl font-semibold w-10 text-center tabular-nums">
                {minPertandingan}
              </span>
              <button
                className="btn btn-sm btn-ghost border border-base-300"
                onClick={() => setMinPertandingan(minPertandingan + 1)}
                disabled={loading}
              >
                +
              </button>
              <span className="text-sm text-base-content/50">kali per tim</span>
            </div>
            <p className="text-xs text-base-content/40 mt-2">
              Setiap tim akan bermain minimal sejumlah ini untuk setiap kelompok umur.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-success/5 border border-success/20 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-success mb-2">Cara kerja sistem</p>
            <ul className="space-y-1.5">
              {[
                "Mengambil semua tim terdaftar beserta kelompok umurnya",
                "Membuat kombinasi pertandingan secara acak per kelompok umur",
                "Memastikan setiap tim bermain minimal sesuai jumlah dipilih",
                "Jadwal ditampilkan untuk review sebelum disimpan",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-xs text-base-content/60">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Button */}
          <button
            className="btn btn-success w-full"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Memproses...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Generate Jadwal Random
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-base-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
                <h3 className="font-semibold text-base">Preview jadwal pertandingan</h3>
              </div>
              <button
                className="btn btn-sm btn-ghost btn-circle"
                onClick={handleCancel}
                disabled={loading}
              >
                ✕
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-base-200">
              <div className="stat bg-base-200/50 rounded-xl p-3">
                <div className="stat-title text-xs">Total pertandingan</div>
                <div className="stat-value text-2xl">{previewData.total_matches}</div>
              </div>
              <div className="stat bg-base-200/50 rounded-xl p-3">
                <div className="stat-title text-xs">Kelompok umur</div>
                <div className="stat-value text-base font-semibold leading-snug mt-1">
                  {previewData.age_groups?.join(", ")}
                </div>
              </div>
              <div className="stat bg-base-200/50 rounded-xl p-3">
                <div className="stat-title text-xs">Min. main/tim</div>
                <div className="stat-value text-2xl">{previewData.min_pertandingan}x</div>
              </div>
            </div>

            {/* Match List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-base-content/40 mb-3">
                Daftar pertandingan
              </p>
              <div className="space-y-2">
                {previewData.data?.map((jadwal, idx) => (
                  <div
                    key={idx}
                    className="border border-base-200 rounded-xl px-4 py-3 hover:bg-base-200/40 transition-colors"
                  >
                    <div className="grid grid-cols-[1fr_auto_1fr_auto_auto] gap-4 items-center">
                      <div>
                        <p className="text-xs text-base-content/40 mb-0.5">Tim 1</p>
                        <p className="text-sm font-medium">
                          {jadwal.tim_1_nama}{" "}
                          <span className="text-xs font-normal text-base-content/40">
                            ({jadwal.tim_1_kelompok_umur})
                          </span>
                        </p>
                      </div>
                      <div className="badge badge-ghost text-xs px-2">vs</div>
                      <div>
                        <p className="text-xs text-base-content/40 mb-0.5">Tim 2</p>
                        <p className="text-sm font-medium">
                          {jadwal.tim_2_nama}{" "}
                          <span className="text-xs font-normal text-base-content/40">
                            ({jadwal.tim_2_kelompok_umur})
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/40 mb-0.5">Waktu</p>
                        <p className="text-xs font-medium">
                          {new Date(jadwal.waktu_pertandingan).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/40 mb-0.5">Lokasi</p>
                        <p className="text-xs font-medium">{jadwal.lokasi_lapangan}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-base-200">
              <button
                className="btn btn-sm btn-ghost border border-base-300"
                onClick={handleCancel}
                disabled={loading}
              >
                Batalkan
              </button>
              <button
                className="btn btn-sm btn-success"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    Simpan jadwal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}