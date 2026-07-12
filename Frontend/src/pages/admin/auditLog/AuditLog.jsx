import DataTable from "../../../components/DataTable";
import { API_URL } from "@/data/api";

const ACTION_COLORS = {
  create: { cls: "badge-success", dot: true },
  update: { cls: "badge-warning", dot: true },
  delete: { cls: "badge-error", dot: true },
  login: { cls: "badge-info", dot: true },
  logout: { cls: "badge-neutral", dot: true },
};

const columns = [
  { key: "created_at", label: "Waktu", type: "datetime" },
  { key: "user_name", label: "Pengguna" },
  { key: "tabel", label: "Tabel" },
  { key: "aksi", label: "Aksi", type: "badge", colorMap: ACTION_COLORS },
  { key: "deskripsi", label: "Deskripsi" },
];

export default function AuditLog() {
  return (
    <DataTable
      endpoint={`${API_URL}/audit-log`}
      title="Log Audit"
      dataKey="data"
      perPage={10}
      searchFields={["user_name", "tabel", "aksi", "deskripsi"]}
      filterFields={["aksi"]}
      filterOptionsProp={{
        aksi: ["create", "update", "delete", "login", "logout"],
      }}
      columns={columns}
      sortable={true}
      serverSide={true}
    />
  );
}
