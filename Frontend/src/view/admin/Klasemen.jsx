import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DataTable from "../DataTable";

const klasemenFields = [
  {
    key: "tim_id",
    label: "Tim ID",
    type: "number",
    required: true,
  },
];

const columns = [
  {
    key: "nama_tim",
    label: "Tim",
  },
  {
    key: "main",
    label: "M",
  },
  {
    key: "menang",
    label: "W",
  },
  {
    key: "seri",
    label: "D",
  },
  {
    key: "kalah",
    label: "L",
  },
  {
    key: "gol_masuk",
    label: "GM",
  },
  {
    key: "gol_kemasukan",
    label: "GK",
  },
  {
    key: "selisih_gol",
    label: "SG",
  },
  {
    key: "poin",
    label: "Pts",
  },
];

export default function Klasemen() {
  const { id } = useParams();
  const [namaEvent, setNamaEvent] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://127.0.0.1:8000/api/events/${id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Gagal mengambil event:",
            response.status,
            response.statusText
          );
          return;
        }

        const result = await response.json();

        setNamaEvent(
          result.data?.nama_event ||
            result.nama_event ||
            result.data?.event?.nama_event ||
            "Event"
        );
      } catch (error) {
        console.error("Gagal mengambil data event:", error);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  return (
    <DataTable
      endpoint={`http://127.0.0.1:8000/api/klasemen?event_id=${id}`}
      title={`Data Klasemen${namaEvent ? ` - ${namaEvent}` : ""}`}
      searchFields={["tim_id"]}
      columns={columns}
      createFields={klasemenFields}
    />
  );
}