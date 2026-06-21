import { Check, X, Eye } from "lucide-react";
import DataTable from "@/view/DataTable";
import { pendaftaranApi } from "@/data/services";

export default function Pendaftaran() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const handleVerify = async (row, status) => {
    try {
      await pendaftaranApi.verify(row.id, status);
      window.location.reload();
    } catch (error) {
      console.error("Error verifying pendaftaran:", error);
      alert("Gagal memverifikasi pendaftaran");
    }
  };

  const columns = [
    { key: "tim", label: "Nama Tim", render: (row) => row.tim?.nama_tim || "-" },
    { key: "event", label: "Event", render: (row) => row.event?.nama_event || "-" },
    { key: "tanggal_daftar", label: "Tanggal Daftar", type: "date" },
    {
      key: "dokumen_pendukung",
      label: "Dokumen",
      render: (row) =>
        row.dokumen_pendukung ? (
          <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <Eye size={16} />
            Lihat
          </button>
        ) : (
          <span className="text-base-content/40">-</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      type: "badge",
      colorMap: {
        diterima: { cls: "badge-success", dot: true },
        ditolak: { cls: "badge-error", dot: true },
        menunggu: { cls: "badge-warning", dot: true },
      },
    },
  ];

  const actions = [
    {
      label: "Terima",
      icon: <Check size={14} />,
      color: "#22c55e",
      onClick: (row) => {
        if (row.status === "menunggu") handleVerify(row, "diterima");
      },
    },
    {
      label: "Tolak",
      icon: <X size={14} />,
      color: "#ef4444",
      onClick: (row) => {
        if (row.status === "menunggu") handleVerify(row, "ditolak");
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pendaftaran</h1>
        <p className="text-base-content/60 mt-2">Verifikasi pendaftaran tim ke event</p>
      </div>
      <DataTable
        endpoint={`${API_URL}/pendaftaran`}
        title="Daftar Pendaftaran"
        dataKey="data"
        columns={columns}
        filterFields={["status"]}
        searchFields={["status"]}
        actions={actions}
      />
    </div>
  );
}
