import DataTable from "../DataTable";
import { Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  draft: {
    bg: "rgba(255,193,7,0.15)",
    color: "#b8860b",
    dot: true,
  },
  aktif: {
    bg: "rgba(99,153,34,0.12)",
    color: "#3b6d11",
    dot: true,
  },
  selesai: {
    bg: "rgba(54,162,235,0.12)",
    color: "#1d4ed8",
    dot: true,
  },
};

const eventFields = [
  {
    key: "nama_event",
    label: "Nama Event",
    type: "text",
    required: true,
  },
  {
    key: "deskripsi",
    label: "Deskripsi",
    type: "textarea",
  },
  {
    key: "tanggal_mulai",
    label: "Tanggal Mulai",
    type: "date",
    required: true,
  },
  {
    key: "tanggal_selesai",
    label: "Tanggal Selesai",
    type: "date",
    required: true,
  },
  {
    key: "lokasi",
    label: "Lokasi",
    type: "text",
    required: true,
  },
  {
    key: "kuota_tim",
    label: "Kuota Tim",
    type: "number",
    required: true,
  },
  {
    key: "biaya_pendaftaran",
    label: "Biaya Pendaftaran",
    type: "number",
    required: true,
  },
  {
    key: "status",
    label: "Status",
    options: ["draft", "aktif", "selesai"],
  },
];

const columns = [
  { key: "nama_event", label: "Nama Event" },
  { key: "lokasi", label: "Lokasi" },
  { key: "tanggal_mulai", label: "Tanggal Mulai" },
  { key: "tanggal_selesai", label: "Tanggal Selesai" },
  { key: "kuota_tim", label: "Kuota Tim" },
  {
    key: "biaya_pendaftaran",
    label: "Biaya Pendaftaran",
  },
  {
    key: "status",
    label: "Status",
    type: "badge",
    colorMap: STATUS_COLORS,
  },
];

export default function Event() {
  const navigate = useNavigate();

  return (
    <DataTable
      endpoint="http://127.0.0.1:8000/api/events"
      title="Daftar Event"
      searchFields={["nama_event", "lokasi"]}
      filterFields={["status"]}
      columns={columns}
      editable
      
      creatable
      deleteLabelKey="nama_event"
      deleteSubKey="lokasi"
      editFields={eventFields}
      createFields={eventFields}
      actions={[
        {
          icon: <Calendar size={14} />,
          tooltip: "Klasemen",
          label: "Klasemen",
          color: "#3b82f6",
          onClick: (row) => {
            navigate(`/admin/events/${row.id}/klasemen`);
          },
        },
      ]}
    />
  );
}
