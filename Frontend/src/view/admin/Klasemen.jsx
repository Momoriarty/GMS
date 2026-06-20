import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DataTable from "../DataTable";
import { Calendar } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api";

const klasemenFields = [
  {
    key: "tim_id",
    label: "Tim ID",
    type: "number",
    required: true,
  },
];

const columns = [
  { key: "nama_tim", label: "Tim" },
  { key: "main", label: "M" },
  { key: "menang", label: "W" },
  { key: "seri", label: "D" },
  { key: "kalah", label: "L" },
  { key: "gol_masuk", label: "GM" },
  { key: "gol_kemasukan", label: "GK" },
  { key: "selisih_gol", label: "SG" },
  { key: "poin", label: "Pts" },
];

export default function Klasemen() {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ FIX UTAMA

  const [namaEvent, setNamaEvent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/events/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP Error ${res.status}`);
        }

        const json = await res.json();

        const eventName =
          json?.data?.nama_event ??
          json?.data?.event?.nama_event ??
          json?.nama_event ??
          "Event";

        setNamaEvent(eventName);
      } catch (err) {
        console.error("Gagal ambil event:", err);
        setNamaEvent("Event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  return (
    <div>
      <div className="p-6">
        <Link
          to={`/admin/events/`}
          className="btn btn-ghost btn-sm"
          title="Kembali ke Event"
        >
          ← Kembali
        </Link>
      </div>
      <DataTable
        endpoint={`${API_BASE}/klasemen?event_id=${id}`}
        title={
          loading
            ? "Data Klasemen..."
            : `Data Klasemen - ${namaEvent}`
        }
        searchFields={["tim_id", "nama_tim"]}
        columns={columns}
        createFields={klasemenFields}
        actions={[
          {
            icon: <Calendar size={13} />,
            label: "Jadwal",
            tooltip: "Lihat Jadwal Tim",
            color: "oklch(var(--su))",
            onClick: (row) =>
              navigate(`/admin/events/${id}/tim/${row.id}/jadwal`)
          },
        ]}
      />
    </div>
  );
}