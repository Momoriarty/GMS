import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DataCard from "../DataCard";
import GenerateJadwalRandom from "./GenerateJadwalRandom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function JadwalPertandingan() {
  const { id, timId } = useParams();

  const [eventName, setEventName] = useState("Event");
  const [timName, setTimName] = useState("");
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // AMBIL EVENT
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_BASE}/events/${id}`, { headers });
        const json = await res.json();

        const nama = json?.data?.nama_event || json?.nama_event;
        if (nama) setEventName(nama);
      } catch (err) {
        console.error("Gagal ambil event:", err);
      }
    };

    // AMBIL JADWAL
    const fetchJadwal = async () => {
      try {
        setLoading(true);

        const endpoint = timId
          ? `${API_BASE}/jadwal-pertandingan?event_id=${id}&tim_id=${timId}`
          : `${API_BASE}/jadwal-pertandingan?event_id=${id}`;

        const res = await fetch(endpoint, { headers });
        const json = await res.json();

        const data = json?.data || json;

        if (Array.isArray(data)) {
          setJadwalList(data);

          // Ambil nama tim dari data pertama
          if (timId && data.length > 0) {
            const first = data[0];

            if (String(first.tim_1_id) === String(timId)) {
              setTimName(first.tim_1_nama);
            } else if (String(first.tim_2_id) === String(timId)) {
              setTimName(first.tim_2_nama);
            }
          }
        }
      } catch (err) {
        console.error("Gagal ambil jadwal:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
      fetchJadwal();
    }
  }, [id, timId]);

  // TITLE
  const title = timId
    ? `Jadwal ${timName || `Tim ${timId}`} - ${eventName}`
    : `Jadwal ${eventName}`;

  // ACTION
  const handleEdit = (matchId) => {
    alert(`Edit pertandingan ID: ${matchId}`);
  };

  const handleHapus = (matchId) => {
    if (confirm("Yakin ingin menghapus jadwal ini?")) {
      alert(`Hapus pertandingan ID: ${matchId}`);
    }
  };

  return (
    <div className="p-6 text-base-content">

      {/* GENERATE JADWAL - Only show at event level, not per tim */}
      {!timId && (
        <div className="mb-8">
          <GenerateJadwalRandom />
        </div>
      )}

      {/* INFO - Generate Jadwal hanya bisa di event level */}
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

      {/* HEADER */}
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

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-10 opacity-60">
          Memuat jadwal pertandingan...
        </div>
      ) : jadwalList.length === 0 ? (
        /* EMPTY STATE */
        <div className="text-center py-10 border border-dashed rounded-lg opacity-60">
          Belum ada jadwal pertandingan
        </div>
      ) : (
        /* LIST CARD */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jadwalList.map((match) => (
            <DataCard
              key={match.id}
              titleLeft={match.tim_1_nama}
              titleRight={match.tim_2_nama}
              date={new Date(match.waktu_pertandingan).toLocaleString(
                "id-ID",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
              location={match.lokasi_lapangan}
              onEdit={() => handleEdit(match.id)}
              onDelete={() => handleHapus(match.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}