import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import DataCard from "../../../components/DataCard";
import GenerateJadwalRandom from "./GenerateJadwalRandom";

const API_BASE = "http://127.0.0.1:8000/api";

// =========================================================================
// SUB-KOMPONEN FORM: Mengelola Form Skor & Dropdown Status
// Menggunakan nilai awal dari data objek `match` agar skor lama langsung muncul
// =========================================================================
function FormSkorPertandingan({ match, onSave, onClose }) {
  // Otomatis mengisi form dengan data skor yang sudah ada dari API (jika ada)
  const [skor1, setSkor1] = useState(match.skor_tim_1 ?? "");
  const [skor2, setSkor2] = useState(match.skor_tim_2 ?? "");
  const [statusOpsi, setStatusOpsi] = useState(match.status || "terjadwal");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: match.id,
      skor_tim_1: skor1,
      skor_tim_2: skor2,
      status: statusOpsi,
    });
    onClose(); // Menutup modal DaisyUI setelah data dikirim
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Detail Nama Tim */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="w-[40%] text-right font-semibold truncate">{match.tim_1_nama}</div>
        <div className="text-xs opacity-50 font-bold">VS</div>
        <div className="w-[40%] text-left font-semibold truncate">{match.tim_2_nama}</div>
      </div>

      {/* Input Angka Skor */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <input
          type="number"
          min="0"
          placeholder="0"
          className="input input-bordered w-20 text-center text-xl font-bold"
          value={skor1}
          onChange={(e) => setSkor1(e.target.value)}
          required
        />
        <div className="text-xl font-bold">:</div>
        <input
          type="number"
          min="0"
          placeholder="0"
          className="input input-bordered w-20 text-center text-xl font-bold"
          value={skor2}
          onChange={(e) => setSkor2(e.target.value)}
          required
        />
      </div>

      {/* Dropdown Status Pertandingan */}
      <div className="form-control w-full mb-6">
        <label className="label py-1">
          <span className="label-text text-xs font-semibold">Status Pertandingan:</span>
        </label>
        <select
          value={statusOpsi}
          onChange={(e) => setStatusOpsi(e.target.value)}
          className="select select-bordered select-sm w-full font-medium"
        >
          <option value="terjadwal">Terjadwal (Belum Mulai)</option>
          <option value="selesai">Selesai (Update Klasemen)</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>
      </div>

      {/* Tombol Aksi di dalam Modal */}
      <div className="modal-action flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
          Batal
        </button>
        <button type="submit" className="btn btn-info btn-sm text-white">
          Simpan Data
        </button>
      </div>
    </form>
  );
}

// =========================================================================
// KOMPONEN UTAMA
// =========================================================================
export default function JadwalPertandingan() {
  const { id, timId } = useParams();
  const [eventName, setEventName] = useState("Event");
  const [timName, setTimName] = useState("");
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/events/${id}`, {
        headers: getHeaders(),
      });
      const json = await res.json();
      const nama = json?.data?.nama_event || json?.nama_event;
      if (nama) setEventName(nama);
    } catch (err) {
      console.error("Gagal ambil event:", err);
    }
  }, [id]);

  const fetchJadwal = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = timId
        ? `${API_BASE}/jadwal-pertandingan?event_id=${id}&tim_id=${timId}`
        : `${API_BASE}/jadwal-pertandingan?event_id=${id}`;

      const res = await fetch(endpoint, { headers: getHeaders() });
      const json = await res.json();
      
      // Handle Laravel Paginator response structure (json.data might be the paginator object)
      const data = Array.isArray(json?.data?.data) 
        ? json.data.data 
        : (Array.isArray(json?.data) ? json.data : []);

      if (Array.isArray(data)) {
        setJadwalList(data);
        if (timId && data.length > 0) {
          const firstMatch = data[0];
          const isTim1 = String(firstMatch.tim_1_id) === String(timId);
          setTimName(isTim1 ? firstMatch.tim_1_nama : firstMatch.tim_2_nama);
        }
      }
    } catch (err) {
      console.error("Gagal ambil jadwal:", err);
    } finally {
      setLoading(false);
    }
  }, [id, timId]);

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchJadwal();
    }
  }, [id, fetchEvent, fetchJadwal]);

  const handleUpdateSkor = async (skorData) => {
    try {
      const res = await fetch(
        `${API_BASE}/hasil-pertandingan/${skorData.id}/update`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            skor_tim_1: parseInt(skorData.skor_tim_1, 10),
            skor_tim_2: parseInt(skorData.skor_tim_2, 10),
            status: skorData.status,
          }),
        },
      );

      const json = await res.json();

      if (res.ok) {
        alert("Pertandingan berhasil diperbarui!");
        fetchJadwal(); // Ambil ulang data agar UI tersinkronisasi
      } else {
        alert(`Gagal update skor: ${json.message || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      console.error("Gagal update skor:", err);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleHapusJadwal = async (matchId) => {
    try {
      alert(`Kirim ke API Delete Jadwal ID: ${matchId}`);
    } catch (err) {
      console.error("Gagal menghapus jadwal:", err);
    }
  };

  const title = timId
    ? `Jadwal ${timName || `Tim ${timId}`} - ${eventName}`
    : `Jadwal ${eventName}`;

  return (
    <div className="p-6 text-base-content">
      {!timId && (
        <div className="mb-8">
          <GenerateJadwalRandom />
        </div>
      )}

      {timId && (
        <div className="mb-8 bg-blue-50 border border-blue-300 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            💡 Untuk generate jadwal pertandingan, silakan kembali ke halaman{" "}
            <Link
              to={`/admin/events/${id}/jadwal`}
              className="font-semibold underline hover:text-blue-900"
            >
              Jadwal Event
            </Link>
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link
            to={`/admin/events/${id}/klasemen`}
            className="btn btn-ghost btn-sm"
            title="Kembali ke Event"
          >
            ← Kembali
          </Link>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-sm opacity-60">
              {jadwalList.length} Total Pertandingan
            </p>
          </div>
        </div>
        <button className="btn btn-success btn-sm text-white">
          + Tambah Jadwal
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 opacity-60">
          Memuat jadwal pertandingan...
        </div>
      ) : jadwalList.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg opacity-60">
          Belum ada jadwal pertandingan
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jadwalList.map((match) => {
            // Pengondisian warna style badge status luar card secara dinamis
            const badgeStyle =
              match.status === "selesai" ? "badge-success text-white" :
              match.status === "dibatalkan" ? "badge-error text-white" : "badge-warning";

            // Format Skor Teks Kecil Tambahan jika Match sudah selesai
            const currentScoreText = match.status === "selesai" 
              ? ` (${match.skor_tim_1} - ${match.skor_tim_2})` 
              : "";

            return (
              <DataCard
                key={match.id}
                id={match.id}
                titleLeft={match.tim_1_nama}
                titleRight={match.tim_2_nama}
                location={match.lokasi_lapangan}
                onDelete={handleHapusJadwal}
                date={new Date(match.waktu_pertandingan).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                
                // --- PROPS KUSTOMISASI UNTUK DATACARD AGAR TETAP REUSABLE ---
                badgeText={(match.status || "VS") + currentScoreText}
                badgeClassName={badgeStyle}
                actionButtonText="✏️ Input Skor"
                editModalTitle="Input Hasil Pertandingan"
                
                // Menyuntikkan Sub-Komponen Form Skor Menggunakan Render Props
                editModalContent={(closeModal) => (
                  <FormSkorPertandingan
                    match={match}
                    onSave={handleUpdateSkor}
                    onClose={closeModal}
                  />
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
