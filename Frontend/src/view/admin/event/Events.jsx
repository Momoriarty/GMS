import DataTable from "../../DataTable";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  draft: { cls: "badge-warning", dot: true },
  aktif: { cls: "badge-success", dot: true },
  selesai: { cls: "badge-info", dot: true },
};

const eventFields = [
  {
    key: "nama_event",
    label: "Nama Event",
    type: "text",
    placeholder: "Contoh: Turnamen Futsal Garuda Cup 2025",
    required: true,
    colSpan: 2,
  },
  {
    key: "deskripsi",
    label: "Deskripsi",
    type: "textarea",
    placeholder: "Deskripsi singkat tentang event ini…",
    colSpan: 2,
  },
  {
    key: "lokasi",
    label: "Lokasi",
    type: "text",
    placeholder: "Contoh: GOR Garuda, Pekanbaru",
    required: true,
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "draft", label: "Draft" },
      { value: "aktif", label: "Aktif" },
      { value: "selesai", label: "Selesai" },
    ],
  },
  {
    key: "tanggal_mulai",
    label: "Tanggal & Waktu Mulai",
    type: "datetime-local", // ← diubah
    required: true,
  },
  {
    key: "tanggal_selesai",
    label: "Tanggal & Waktu Selesai",
    type: "datetime-local", // ← diubah
    required: true,
  },
  {
    key: "kuota_tim",
    label: "Kuota Tim",
    type: "number",
    placeholder: "Contoh: 16",
    hint: "Jumlah maksimal tim",
    required: true,
  },
  {
    key: "biaya_pendaftaran",
    label: "Biaya Pendaftaran (Rp)",
    type: "currency-input",
    placeholder: "Contoh: 500000",
    hint: "Nominal rupiah tanpa titik/koma",
    required: true,
  },
];

const columns = [
  { key: "nama_event", label: "Nama Event" },
  { key: "lokasi", label: "Lokasi" },
  { key: "tanggal_mulai", label: "Tgl Mulai", type: "datetime" },   // ← diubah
  { key: "tanggal_selesai", label: "Tgl Selesai", type: "datetime" }, // ← diubah
  { key: "kuota_tim", label: "Kuota", type: "number" },
  { key: "biaya_pendaftaran", label: "Biaya Daftar", type: "currency" },
  { key: "status", label: "Status", type: "badge", colorMap: STATUS_COLORS },
];

export default function Event() {
  const navigate = useNavigate();

  return (
    <DataTable
      endpoint="http://127.0.0.1:8000/api/events"
      title="Daftar Event"
      dataKey="data"
      perPage={10}
      searchFields={["nama_event", "lokasi"]}
      filterFields={["status"]}
      columns={columns}
      editable
      editFields={eventFields}
      creatable
      createFields={eventFields}
      actions={[
        {
          icon: <Calendar size={13} />,
          label: "Klasemen",
          tooltip: "Lihat Klasemen",
          color: "oklch(var(--in))",
          onClick: (row) => navigate(`/admin/events/${row.id}/klasemen`),
        },
        {
          icon: <Calendar size={13} />,
          label: "Jadwal",
          tooltip: "Jadwal",
          color: "oklch(var(--in))",
          onClick: (row) => navigate(`/admin/events/${row.id}/jadwal`),
        },
      ]}
    />
  );
}